import { Injectable, Inject, forwardRef, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Markup, Context } from 'telegraf';
import { PrismaService } from '../../prisma/prisma.service';
import { CatalogService } from '../catalog/catalog.service';
import { CartService } from '../cart/cart.service';
import { OrdersService } from '../orders/orders.service';
import { formatPrice } from './telegram.utils';

interface BotContext extends Context {
  session?: {
    locale: string;
    selectedCategorySlug?: string;
    selectedProductId?: string;
    selectedVariantId?: string;
  };
}

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private bot: Telegraf<BotContext> | null = null;
  private readonly adminChatId: string | undefined;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private catalog: CatalogService,
    private cartService: CartService,
    @Inject(forwardRef(() => OrdersService))
    private ordersService: OrdersService,
  ) {
    this.adminChatId = config.get<string>('TELEGRAM_ADMIN_CHAT_ID');
  }

  onModuleInit() {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN not set — bot disabled');
      return;
    }
    // Fire-and-forget: starting the bot must NEVER block or crash the REST API.
    // (api.telegram.org may be unreachable on this network — that must not matter.)
    void this.startBot(token);
  }

  private async startBot(token: string) {
    const bot = new Telegraf<BotContext>(token);
    this.registerHandlers(bot);

    // Fast connectivity probe before entering the long-polling loop, so an
    // unreachable Telegram (ETIMEDOUT) disables the bot cleanly instead of
    // crashing the API process with unhandled polling errors.
    try {
      await Promise.race([
        bot.telegram.getMe(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('connectivity timeout (5s)')), 5000),
        ),
      ]);
    } catch (err) {
      this.logger.warn(
        `Telegram unreachable — bot disabled (${(err as Error).message}). ` +
          'Use a WARP/proxy to reach api.telegram.org, or clear TELEGRAM_BOT_TOKEN to silence this.',
      );
      return;
    }

    this.bot = bot;
    bot.launch().catch((err) => this.logger.error('Telegram bot stopped', err));
    // Never let a later polling/network error take down the process.
    bot.catch((err) => this.logger.error('Telegram handler error', err));
    this.logger.log('Telegram bot started (long-polling)');
  }

  async onModuleDestroy() {
    this.bot?.stop('SIGTERM');
  }

  // ── Public method for new-order alerts ────────────────────────────────────

  async notifyNewOrder(orderNumber: string, totalUzs: string, customerName: string | null) {
    if (!this.bot || !this.adminChatId) return;
    try {
      await this.bot.telegram.sendMessage(
        this.adminChatId,
        `🛍 New order <b>${orderNumber}</b>\n` +
          `Customer: ${customerName ?? 'Guest'}\n` +
          `Total: ${formatPrice(totalUzs)}`,
        { parse_mode: 'HTML' },
      );
    } catch (err) {
      this.logger.warn('Failed to send admin alert', err);
    }
  }

  async notifyOrderCancelled(orderNumber: string) {
    if (!this.bot || !this.adminChatId) return;
    try {
      await this.bot.telegram.sendMessage(
        this.adminChatId,
        `❌ Order <b>${orderNumber}</b> was cancelled by the customer`,
        { parse_mode: 'HTML' },
      );
    } catch (err) {
      this.logger.warn('Failed to send admin alert', err);
    }
  }

  // ── Private: register all handlers ────────────────────────────────────────

  private registerHandlers(bot: Telegraf<BotContext>) {
    // /start — link account, set locale
    bot.start(async (ctx) => {
      const telegramId = BigInt(ctx.from.id);
      const firstName = ctx.from.first_name ?? '';

      let user = await this.prisma.user.findUnique({ where: { telegramId } });
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            telegramId,
            name: firstName,
            locale: 'en',
          },
        });
      }

      await ctx.reply(
        `👋 Welcome to TechStore, ${firstName}!\n\nBrowse our catalog or manage your orders.`,
        Markup.keyboard([['📦 Catalog', '🛒 Cart'], ['📋 My orders', '⚙️ Settings']])
          .resize()
          .persistent(),
      );
    });

    // Catalog
    bot.hears('📦 Catalog', async (ctx) => {
      const categories = await this.catalog.listCategories();
      if (categories.length === 0) {
        await ctx.reply('No categories available yet.');
        return;
      }
      await ctx.reply(
        'Choose a category:',
        Markup.inlineKeyboard(
          categories.map((c) => [Markup.button.callback(c.nameEn, `cat:${c.slug}`)]),
        ),
      );
    });

    // Category selected
    bot.action(/^cat:(.+)$/, async (ctx) => {
      try { await ctx.answerCbQuery(); } catch {}
      const slug = ctx.match[1];
      const products = await this.catalog.listProducts({ categorySlug: slug, limit: 10 });

      if (products.items.length === 0) {
        await ctx.reply('No products in this category.');
        return;
      }

      await ctx.reply(
        `Found ${products.total} product${products.total !== 1 ? 's' : ''}:`,
        Markup.inlineKeyboard(
          products.items.map((p) => [
            Markup.button.callback(
              `${p.titleEn}${p.condition === 'USED' ? ' (Used)' : ''}`,
              `prod:${p.id}`,
            ),
          ]),
        ),
      );
    });

    // Product selected
    bot.action(/^prod:(.+)$/, async (ctx) => {
      try { await ctx.answerCbQuery(); } catch {}
      const productId = ctx.match[1];
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        include: { variants: true, brand: true, images: { take: 1 } },
      });

      if (!product) { await ctx.reply('Product not found.'); return; }

      const variant = product.variants[0];
      let text = `*${product.titleEn}*\n`;
      if (product.brand) text += `Brand: ${product.brand.name}\n`;
      text += `Condition: ${product.condition}`;
      if (product.grade) text += ` (Grade ${product.grade})`;
      text += '\n';
      if (product.batteryHealth) text += `Battery: ${product.batteryHealth}%\n`;
      if (product.conditionNotes) text += `Notes: ${product.conditionNotes}\n`;
      if (variant) text += `\nPrice: ${formatPrice(variant.priceUzs.toString())}`;

      const buttons = product.variants.map((v) => {
        const label = [v.storage, v.color].filter(Boolean).join(' / ') || 'Order';
        return [Markup.button.callback(`🛒 ${label} — ${formatPrice(v.priceUzs.toString())}`, `add:${v.id}`)];
      });

      await ctx.replyWithMarkdown(text, Markup.inlineKeyboard(buttons));
    });

    // Add to cart
    bot.action(/^add:(.+)$/, async (ctx) => {
      try { await ctx.answerCbQuery('Adding to cart…'); } catch {}
      const variantId = ctx.match[1];
      const telegramId = BigInt(ctx.from!.id);
      const user = await this.prisma.user.findUnique({ where: { telegramId } });

      if (!user) {
        await ctx.reply('Please /start first.');
        return;
      }

      await this.cartService.addItem(user.id, { variantId, quantity: 1 });
      await ctx.reply('✅ Added to cart! Use 🛒 Cart to view your items.');
    });

    // Cart
    bot.hears('🛒 Cart', async (ctx) => {
      const telegramId = BigInt(ctx.from!.id);
      const user = await this.prisma.user.findUnique({ where: { telegramId } });
      if (!user) { await ctx.reply('Please /start first.'); return; }

      const cartData = await this.cartService.getCart(user.id);
      if (!cartData || cartData.items.length === 0) {
        await ctx.reply('Your cart is empty. Browse 📦 Catalog to add items.');
        return;
      }

      let text = '🛒 *Your cart:*\n\n';
      for (const item of cartData.items) {
        const v = item.variant;
        text += `• ${(v as any).product?.titleEn ?? 'Item'} × ${item.quantity} — ${formatPrice(String(v.priceUzs))}\n`;
      }
      text += `\n*Total: ${formatPrice(cartData.total)}*`;

      await ctx.replyWithMarkdown(
        text,
        Markup.inlineKeyboard([
          [Markup.button.callback('✅ Checkout (Cash)', 'checkout:CASH')],
          [Markup.button.callback('💳 Checkout (Payme)', 'checkout:PAYME')],
          [Markup.button.callback('🗑 Clear cart', 'cart:clear')],
        ]),
      );
    });

    // Checkout from bot
    bot.action(/^checkout:(.+)$/, async (ctx) => {
      try { await ctx.answerCbQuery('Processing…'); } catch {}
      const provider = ctx.match[1];
      const telegramId = BigInt(ctx.from!.id);
      const user = await this.prisma.user.findUnique({ where: { telegramId } });
      if (!user) { await ctx.reply('Please /start first.'); return; }

      try {
        const order = await this.ordersService.createOrder(
          user.id,
          { paymentProvider: provider as any, address: { line1: 'Telegram order', city: 'Tashkent' } },
          'telegram',
        );

        let msg = `✅ Order *${order.number}* placed!\nTotal: ${formatPrice(order.totalUzs.toString())}`;

        if (provider !== 'CASH') {
          const webUrl = this.config.get<string>('WEB_URL') ?? 'http://localhost:3000';
          msg += `\n\nPay here: ${webUrl}/orders/${order.id}`;
        }

        await ctx.replyWithMarkdown(msg);
      } catch (err: any) {
        await ctx.reply(`❌ ${err.message ?? 'Could not place order.'}`);
      }
    });

    // Clear cart
    bot.action('cart:clear', async (ctx) => {
      try { await ctx.answerCbQuery(); } catch {}
      const telegramId = BigInt(ctx.from!.id);
      const user = await this.prisma.user.findUnique({ where: { telegramId } });
      if (!user) { await ctx.reply('Please /start first.'); return; }
      await this.cartService.clearCart(user.id);
      await ctx.reply('Cart cleared.');
    });

    // My orders
    bot.hears('📋 My orders', async (ctx) => {
      const telegramId = BigInt(ctx.from!.id);
      const user = await this.prisma.user.findUnique({ where: { telegramId } });
      if (!user) { await ctx.reply('Please /start first.'); return; }

      const result = await this.ordersService.listUserOrders(user.id);
      if (result.items.length === 0) {
        await ctx.reply('You have no orders yet.');
        return;
      }

      let text = '📋 *Your recent orders:*\n\n';
      for (const order of result.items.slice(0, 5)) {
        text += `• *${order.number}* — ${order.status} — ${formatPrice(order.totalUzs.toString())}\n`;
      }
      await ctx.replyWithMarkdown(text);
    });

    // Settings
    bot.hears('⚙️ Settings', async (ctx) => {
      await ctx.reply(
        'Choose your language:',
        Markup.inlineKeyboard([
          [Markup.button.callback('🇺🇿 O\'zbek', 'locale:uz')],
          [Markup.button.callback('🇷🇺 Русский', 'locale:ru')],
          [Markup.button.callback('🇬🇧 English', 'locale:en')],
        ]),
      );
    });

    bot.action(/^locale:(.+)$/, async (ctx) => {
      try { await ctx.answerCbQuery(); } catch {}
      const locale = ctx.match[1];
      const telegramId = BigInt(ctx.from!.id);
      await this.prisma.user.updateMany({ where: { telegramId }, data: { locale } });
      await ctx.reply(`Language set to ${locale}.`);
    });

    bot.catch((err, ctx) => {
      this.logger.error(`Bot error for update ${ctx.update.update_id}`, err);
    });
  }
}
