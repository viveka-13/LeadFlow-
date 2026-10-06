import { Router, Request, Response } from 'express';
import { MetaWebhookPayload, Lead } from '../types';
import { db } from '../storage/db';
import { MetaService } from '../services/meta';

export default function createWebhookRouter(io: any) {
  const router = Router();

  // Webhook Verification (Meta requires this)
  router.get('/meta', (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const verifyToken = process.env.META_VERIFY_TOKEN;

    if (mode && token) {
      if (mode === 'subscribe' && token === verifyToken) {
        console.log('[Meta Webhook] Webhook verified successfully');
        res.status(200).send(challenge);
      } else {
        res.status(403).send('Forbidden');
      }
    } else {
      res.status(400).send('Bad Request');
    }
  });

  // Webhook Event Receiver
  router.post('/meta', async (req: Request, res: Response) => {
    const body = req.body as MetaWebhookPayload;

    if (body.object === 'page') {
      console.log('[Meta Webhook] Received event');
      
      // Acknowledge receipt to Meta quickly
      res.status(200).send('EVENT_RECEIVED');

      if (body.entry && Array.isArray(body.entry)) {
        for (const entry of body.entry) {
          if (entry.changes && Array.isArray(entry.changes)) {
            for (const change of entry.changes) {
              if (change.field === 'leadgen') {
                const leadgenId = change.value.leadgen_id;
                
                // Fetch lead details using the ID
                let lead = await MetaService.fetchLeadDetails(leadgenId);
                
                if (!lead) {
                  // Fallback for local testing if Meta credentials aren't set
                  // We simulate a lead so the PoC works for the user even without a real token
                  console.log(`[Meta] Generating mock lead for leadgen_id: ${leadgenId}`);
                  lead = {
                    id: leadgenId,
                    name: `Test Lead ${Math.floor(Math.random() * 1000)}`,
                    email: `test${leadgenId.substring(0,4)}@example.com`,
                    phone: '+1234567890',
                    createdAt: new Date().toISOString(),
                    source: 'test'
                  };
                }

                // Save lead
                const added = db.addLead(lead);
                
                if (added) {
                  console.log(`[Leads] Saved lead: ${lead.id}`);
                  // Broadcast to connected clients
                  console.log(`[WebSocket] Broadcasting lead.created for ${lead.id}`);
                  io.emit('lead.created', lead);
                } else {
                  console.log(`[Leads] Duplicate lead ignored: ${lead.id}`);
                }
              }
            }
          }
        }
      }
    } else {
      res.sendStatus(404);
    }
  });

  return router;
}
