import DodoPayments from 'dodopayments';

export const dodo = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY || '',
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY || '',
    environment: 'test_mode', // Explicitly set to test_mode to avoid 401 if default is live
});
