export default async function handler(req, res) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send('Token verifikasi tidak cocok');
    }
  }

  if (req.method === 'POST') {
    const body = req.body;

    if (body.object) {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (message && message.type === 'text') {
        const from = message.from;
        const incomingText = message.text.body.toLowerCase().trim();

        let replyText = "Halo! Terima kasih telah menghubungi *Jasa Online Kita*.\n\n" +
          "Silakan pilih informasi yang Anda butuhkan:\n" +
          "1️⃣ Ketik *HARGA* - Daftar paket & harga\n" +
          "2️⃣ Ketik *ORDER* - Format pemesanan\n" +
          "3️⃣ Ketik *ADMIN* - Bicara dengan customer service";

        if (incomingText.includes('harga') || incomingText === '1') {
          replyText = "📋 *Daftar Layanan Jasa Online Kita*:\n\n" +
            "• *Paket Basic*: Rp 150.000\n" +
            "• *Paket Premium*: Rp 350.000\n" +
            "• *Paket Lengkap*: Rp 600.000\n\n" +
            "Ketik *ORDER* untuk langsung memesan.";
        } else if (incomingText.includes('order') || incomingText.includes('pesan') || incomingText === '2') {
          replyText = "📝 *Format Pemesanan*:\n\n" +
            "Silakan balas dengan format:\n" +
            "- Nama:\n" +
            "- Paket Pilihan:\n" +
            "- Keterangan Kebutuhan:\n\n" +
            "Admin kami akan segera mengonfirmasi pesanan Anda.";
        } else if (incomingText.includes('admin') || incomingText === '3') {
          replyText = "Pesan Anda telah diteruskan ke admin. Mohon ditunggu sebentar ya.";
        }

        try {
          await fetch(`https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: from,
              type: 'text',
              text: { body: replyText }
            })
          });
        } catch (error) {
          console.error('Gagal mengirim pesan:', error);
        }
      }

      return res.status(200).send('EVENT_RECEIVED');
    }

    return res.status(404).send();
  }

  return res.status(405).send('Method Not Allowed');
}

