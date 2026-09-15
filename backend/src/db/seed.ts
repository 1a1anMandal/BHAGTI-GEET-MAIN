import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from the root of backend
dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const bhajans = [
  {
    title: 'Om Jai Jagdish Hare',
    language: 'both',
    lyrics: [
      { hindi: 'ॐ जय जगदीश हरे', english: 'Om Jai Jagdish Hare' },
      { hindi: 'स्वामी जय जगदीश हरे', english: 'Swami Jai Jagdish Hare' },
      { hindi: 'भक्त जनों के संकट', english: 'Bhakt Jano Ke Sankat' },
      { hindi: 'दास जनों के संकट', english: 'Daas Jano Ke Sankat' },
      { hindi: 'क्षण में दूर करे', english: 'Kshan Men Door Kare' },
      { hindi: 'ॐ जय जगदीश हरे', english: 'Om Jai Jagdish Hare' }
    ]
  },
  {
    title: 'Vaishnav Jan To',
    language: 'both',
    lyrics: [
      { hindi: 'वैष्णव जन तो तेने कहिये जे', english: 'Vaishnav Jan To Tene Kahiye Je' },
      { hindi: 'पीड परायी जाणे रे', english: 'Peed Paraayi Jaane Re' },
      { hindi: 'पर दुःखे उपकार करे तो ये', english: 'Par Dukhe Upkaar Kare To Ye' },
      { hindi: 'मन अभिमान न आणे रे', english: 'Man Abhimaan Na Aane Re' }
    ]
  },
  {
    title: 'Hanuman Chalisa (Starting Verses)',
    language: 'both',
    lyrics: [
      { hindi: 'श्रीगुरु चरन सरोज रज', english: 'Shree Guru Charan Saroj Raj' },
      { hindi: 'निज मनु मुकुरु सुधारि', english: 'Nij Manu Mukuru Sudhaari' },
      { hindi: 'बरनउँ रघुबर बिमल जसु', english: 'Baranau Raghuvar Bimal Jasu' },
      { hindi: 'जो दायकु फल चारि', english: 'Jo Daayaku Phal Chaari' },
      { hindi: 'बुद्धिहीन तनु जानिके', english: 'Buddhiheen Tanu Jaanike' },
      { hindi: 'सुमिरौं पवन-कुमार', english: 'Sumirau Pavan Kumar' },
      { hindi: 'बल बुधि बिद्या देहु मोहिं', english: 'Bal Budhi Vidya Dehu Mohi' },
      { hindi: 'हरहु कलेस बिकार', english: 'Harahu Kalesa Bikaar' }
    ]
  }
];

async function seed() {
  console.log('Seeding bhajans...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check if we already have bhajans
    const { rows } = await client.query('SELECT count(*) FROM bhajans');
    if (parseInt(rows[0].count) > 0) {
      console.log('Bhajans already exist. Skipping seed.');
    } else {
      for (const bhajan of bhajans) {
        await client.query(
          `INSERT INTO bhajans (title, language, lyrics, added_by) VALUES ($1, $2, $3, $4)`,
          [bhajan.title, bhajan.language, JSON.stringify(bhajan.lyrics), 'System']
        );
      }
      console.log('Successfully seeded bhajans!');
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during seed:', error);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
