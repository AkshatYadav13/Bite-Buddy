import cron from 'node-cron';
import { Restaurant } from '../models/restaurant.model';

// Reset daily earnings at midnight
cron.schedule('0 0 * * *', async () => {
  await Restaurant.updateMany({}, { 'earnings.today': 0 });
  console.log('✅ Reset daily earnings');
});

// Reset weekly earnings every Monday at midnight
cron.schedule('0 0 * * 1', async () => {
  await Restaurant.updateMany({}, { 'earnings.thisWeek': 0 });
  console.log('✅ Reset weekly earnings');
});

// Reset monthly earnings on the 1st of every month at midnight
cron.schedule('0 0 1 * *', async () => {
  await Restaurant.updateMany({}, { 'earnings.thisMonth': 0 });
  console.log('✅ Reset monthly earnings');
});

