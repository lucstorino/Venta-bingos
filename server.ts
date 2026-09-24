import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { dbService, initDatabase } from './src/server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize SQLite database
  initDatabase();

  // Middleware
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(express.static(path.join(process.cwd(), 'public')));

  // ----------------------------------------------------
  // API ROUTES (FIRST)
  // ----------------------------------------------------

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Official Ticket Template image upload and get
  app.get('/api/bingo/template', (req, res) => {
    try {
      const publicDir = path.join(process.cwd(), 'public');
      const pngPath = path.join(publicDir, 'carton_template.png');
      const jpgPath = path.join(publicDir, 'carton_oficial_template.jpg');
      if (fs.existsSync(pngPath)) {
        return res.json({ exists: true, url: '/carton_template.png' });
      }
      if (fs.existsSync(jpgPath)) {
        return res.json({ exists: true, url: '/carton_oficial_template.jpg' });
      }
      res.json({ exists: false, url: null });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/bingo/template', (req, res) => {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'imageBase64 is required' });
      }
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      const jpgPath = path.join(publicDir, 'carton_oficial_template.jpg');
      const pngPath = path.join(publicDir, 'carton_template.png');
      fs.writeFileSync(jpgPath, buffer);
      fs.writeFileSync(pngPath, buffer);
      res.json({ success: true, url: '/carton_template.png' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Universal Image Uploader for Bingos (Cover, Prizes, Template, Extract, Banner)
  app.post('/api/images/upload', (req, res) => {
    try {
      const { bingoId, imageType, imageBase64, filename } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'imageBase64 es obligatorio para subir una imagen.' });
      }

      const cleanBingoId = (bingoId || 'default').replace(/[^a-zA-Z0-9_-]/g, '_');
      const cleanType = (imageType || 'cover').replace(/[^a-zA-Z0-9_-]/g, '_');

      // Determine extension
      let ext = 'jpg';
      const mimeMatch = imageBase64.match(/^data:image\/(\w+);base64,/);
      if (mimeMatch) {
        ext = mimeMatch[1] === 'jpeg' ? 'jpg' : mimeMatch[1];
      } else if (filename) {
        ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
      }

      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'bingos');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const savedFilename = `${cleanBingoId}_${cleanType}_${Date.now()}.${ext}`;
      const filePath = path.join(uploadsDir, savedFilename);
      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/bingos/${savedFilename}`;

      // Update SQLite DB if bingo exists with 5 image types
      const fieldMap: Record<string, string> = {
        cover: 'imageUrl',
        prizes: 'prizesImageUrl',
        template: 'ticketTemplateImage',
        extract: 'extractoImageUrl',
        banner: 'bannerImageUrl',
        tipo1: 'imageUrl',
        tipo2: 'prizesImageUrl',
        tipo3: 'ticketTemplateImage',
        tipo4: 'extractoImageUrl',
        tipo5: 'bannerImageUrl',
      };

      const field = fieldMap[imageType || 'cover'] || 'imageUrl';
      if (bingoId) {
        dbService.updateBingo(bingoId, { [field]: publicUrl } as any);
      }

      res.status(200).json({
        success: true,
        url: publicUrl,
        storagePath: `uploads/bingos/${savedFilename}`,
        imageType: imageType || 'cover',
        bingoId: bingoId || '',
      });
    } catch (e: any) {
      console.error('Error al guardar imagen en servidor:', e);
      res.status(500).json({ error: e.message || 'Error interno al procesar imagen.' });
    }
  });

  // Universal Image Deletion
  app.post('/api/images/delete', (req, res) => {
    try {
      const { bingoId, imageType, url } = req.body;
      if (url && typeof url === 'string' && url.startsWith('/uploads/bingos/')) {
        const localPath = path.join(process.cwd(), 'public', url.replace(/^\//, ''));
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
      }

      const fieldMap: Record<string, string> = {
        cover: 'imageUrl',
        prizes: 'prizesImageUrl',
        template: 'ticketTemplateImage',
        extract: 'extractoImageUrl',
        banner: 'bannerImageUrl',
        tipo1: 'imageUrl',
        tipo2: 'prizesImageUrl',
        tipo3: 'ticketTemplateImage',
        tipo4: 'extractoImageUrl',
        tipo5: 'bannerImageUrl',
      };

      const field = fieldMap[imageType || 'cover'];
      if (bingoId && field) {
        dbService.updateBingo(bingoId, { [field]: '' } as any);
      }

      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 1. Bingos
  app.get('/api/bingos/active', (req, res) => {
    try {
      const bingo = dbService.getActiveBingo();
      if (!bingo) {
        return res.status(404).json({ error: 'No hay ningún bingo activo configurado.' });
      }
      const prizes = dbService.getPrizes(bingo.id);
      res.json({ bingo, prizes });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/bingos', (req, res) => {
    try {
      const bingos = dbService.getAllBingos();
      res.json(bingos);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/bingos', (req, res) => {
    try {
      const bingo = dbService.createBingo(req.body);
      res.status(201).json(bingo);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/bingos/:id', (req, res) => {
    try {
      const updated = dbService.updateBingo(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Bingo no encontrado' });
      }
      res.json(updated);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/bingos/:id', (req, res) => {
    try {
      const deleted = dbService.deleteBingo(req.params.id);
      res.json({ success: deleted });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 2. Cards
  app.get('/api/bingos/:id/cards', (req, res) => {
    try {
      const { status, query, page, limit } = req.query;
      const result = dbService.getCards(req.params.id, {
        status: status as string,
        query: query as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/cards/:id', (req, res) => {
    try {
      const card = dbService.getCardById(req.params.id);
      if (!card) {
        return res.status(404).json({ error: 'Cartón no encontrado' });
      }
      res.json(card);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/cards/:id', (req, res) => {
    try {
      const { numbers, cardNumber } = req.body;
      if (!Array.isArray(numbers) || numbers.length !== 10) {
        return res.status(400).json({ error: 'Debes proporcionar exactamente 10 números para el cartón.' });
      }
      const updated = dbService.updateCardNumbers(req.params.id, numbers, cardNumber);
      if (!updated) {
        return res.status(404).json({ error: 'Cartón no encontrado' });
      }
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/bingos/:id/cards/batch', (req, res) => {
    try {
      const { cards } = req.body;
      if (!Array.isArray(cards) || cards.length === 0) {
        return res.status(400).json({ error: 'Se requiere una lista no vacía de cartones.' });
      }
      const result = dbService.importCardsBatch(req.params.id, cards);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 3. Card Reservation Lock
  app.post('/api/cards/:id/reserve', (req, res) => {
    try {
      const minutes = req.body.minutes || 10;
      const result = dbService.reserveCard(req.params.id, minutes);
      if (!result.success) {
        return res.status(409).json({ error: result.message });
      }
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/cards/:id/release', (req, res) => {
    try {
      const success = dbService.releaseCard(req.params.id);
      res.json({ success });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 4. Orders & Sales
  app.post('/api/orders', (req, res) => {
    try {
      const { bingoId, cardId, customer, amount, paymentMethod, paymentId } = req.body;
      if (!bingoId || !cardId || !customer || !customer.dni) {
        return res.status(400).json({ error: 'Datos de orden incompletos.' });
      }

      const result = dbService.createOrder({
        bingoId,
        cardId,
        customer,
        amount,
        paymentMethod: paymentMethod || 'MERCADO_PAGO',
        paymentId,
      });

      if (!result.success) {
        return res.status(409).json({ error: result.message });
      }

      res.status(201).json(result.order);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/orders', (req, res) => {
    try {
      const bingoId = req.query.bingoId as string | undefined;
      const orders = dbService.getAllOrders(bingoId);
      res.json(orders);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/orders/lookup/:dni', (req, res) => {
    try {
      const orders = dbService.getOrdersByCustomerDni(req.params.dni);
      res.json(orders);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 5. Prizes
  app.get('/api/bingos/:id/prizes', (req, res) => {
    try {
      const prizes = dbService.getPrizes(req.params.id);
      res.json(prizes);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/prizes', (req, res) => {
    try {
      const prize = dbService.createPrize(req.body);
      res.status(201).json(prize);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/prizes/:id', (req, res) => {
    try {
      const success = dbService.updatePrize(req.params.id, req.body);
      res.json({ success });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/prizes/:id', (req, res) => {
    try {
      const success = dbService.deletePrize(req.params.id);
      res.json({ success });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 6. Mercado Pago Configuration & Webhooks
  app.get('/api/mercadopago/config', (req, res) => {
    try {
      const cfg = dbService.getMercadoPagoConfig();
      // Mask access token for security
      res.json({
        ...cfg,
        accessToken: cfg.accessToken ? '••••••••' + cfg.accessToken.slice(-6) : '',
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/mercadopago/config', (req, res) => {
    try {
      dbService.updateMercadoPagoConfig(req.body);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/mercadopago/create-preference', (req, res) => {
    try {
      const { cardId, cardNumber, amount, customer } = req.body;
      const preferenceId = `pref_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      res.json({
        preferenceId,
        initPoint: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`,
        sandboxInitPoint: `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Official Webhook IPN Endpoint (Processes payment.updated notifications)
  app.post('/api/mercadopago/webhook', (req, res) => {
    try {
      const { type, data, action } = req.body;
      console.log(`[MercadoPago Webhook] Notification received:`, { type, action, dataId: data?.id });

      // Here the backend would query MercadoPago API with accessToken to verify status === 'approved'
      // and finalize the transition to SOLD.
      res.status(200).json({ received: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 7. Database Administration & Live Inspector
  app.get('/api/db/stats', (req, res) => {
    try {
      const stats = dbService.getDatabaseStats();
      res.json(stats);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/db/tables', (req, res) => {
    try {
      const tables = dbService.getTables();
      res.json(tables);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/db/query', (req, res) => {
    try {
      const { sql } = req.body;
      if (!sql || typeof sql !== 'string') {
        return res.status(400).json({ error: 'Se requiere una sentencia SQL válida.' });
      }
      const result = dbService.executeQuery(sql);
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/db/reset', (req, res) => {
    try {
      dbService.resetAllData();
      const stats = dbService.getDatabaseStats();
      res.json({ success: true, message: 'Base de datos SQLite restaurada con datos iniciales.', stats });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/reset-data', (req, res) => {
    try {
      dbService.resetAllData();
      res.json({ success: true, message: 'Base de datos restaurada con datos iniciales.' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ----------------------------------------------------
  // VITE MIDDLEWARE SETUP
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Express + SQLite] Servidor ejecutándose en http://0.0.0.0:${PORT}`);
  });
}

startServer();
