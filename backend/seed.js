const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const UserSchema = new mongoose.Schema({ name: String, email: { type: String, unique: true }, password: String, role: { type: String, default: 'user' }, hasOrdered: { type: Boolean, default: false }, createdAt: { type: Date, default: Date.now } });
const MenuSchema = new mongoose.Schema({ name: String, category: String, price: Number, description: String, image: String, available: { type: Boolean, default: true } });
const User = mongoose.model('User', UserSchema);
const MenuItem = mongoose.model('MenuItem', MenuSchema);

const menuItems = [
  { name: 'Classic Burger', category: 'Burgers', price: 12.99, description: 'Juicy 100% Angus beef patty topped with fresh lettuce, ripe tomatoes, and our special sauce.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
  { name: 'Truffle Mushroom Burger', category: 'Burgers', price: 15.99, description: 'Gourmet beef patty smothered in rich truffle mayonnaise and sautéed wild mushrooms.', image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400' },
  { name: 'BBQ Bacon Burger', category: 'Burgers', price: 13.99, description: 'Smoky BBQ sauce with crispy bacon, cheddar cheese and caramelized onions.', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400' },
  { name: 'Margherita Pizza', category: 'Pizza', price: 14.99, description: 'Authentic Italian style with San Marzano tomato sauce, fresh mozzarella and basil.', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
  { name: 'Pepperoni Feast', category: 'Pizza', price: 16.99, description: 'A crowd favorite loaded with double crispy pepperoni slices and extra cheese.', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400' },
  { name: 'BBQ Chicken Pizza', category: 'Pizza', price: 15.99, description: 'Tender grilled chicken, smoky BBQ sauce, red onions and melted mozzarella.', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' },
  { name: 'Dragon Roll', category: 'Sushi', price: 18.99, description: 'Premium sushi roll filled with grilled eel and cucumber, topped with avocado.', image: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400' },
  { name: 'Spicy Tuna Roll', category: 'Sushi', price: 16.99, description: 'Fresh tuna with spicy mayo, cucumber and sesame seeds wrapped in nori.', image: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400' },
  { name: 'Caesar Salad', category: 'Salads', price: 10.99, description: 'Crisp romaine lettuce tossed in creamy Caesar dressing, topped with parmesan.', image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400' },
  { name: 'Greek Salad', category: 'Salads', price: 11.99, description: 'Fresh tomatoes, cucumber, olives, red onion and feta cheese with olive oil dressing.', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400' },
  { name: 'Chocolate Lava Cake', category: 'Desserts', price: 8.99, description: 'Decadent warm chocolate cake with a molten truffle center and vanilla ice cream.', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400' },
  { name: 'Cheesecake', category: 'Desserts', price: 7.99, description: 'Creamy New York style cheesecake with buttery graham cracker crust.', image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400' },
  { name: 'Berry Smoothie', category: 'Drinks', price: 6.99, description: 'Refreshing blend of strawberries, blueberries, and raspberries with yogurt.', image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400' },
  { name: 'Mango Juice', category: 'Drinks', price: 5.99, description: 'Fresh squeezed mango juice, naturally refreshing with no added sugar.', image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
    await MenuItem.deleteMany({});
    await MenuItem.insertMany(menuItems);
    console.log(`✅ ${menuItems.length} menu items seeded!`);
    const existing = await User.findOne({ email: 'admin@galkio.com' });
    if (!existing) {
      const hashed = await bcrypt.hash('admin123', 10);
      await User.create({ name: 'Admin User', email: 'admin@galkio.com', password: hashed, role: 'admin' });
      console.log('✅ Admin: admin@galkio.com | admin123');
    } else { console.log('ℹ️  Admin exists'); }
    console.log('🎉 Done! Run: npm run dev');
    process.exit(0);
  } catch (err) { console.error('❌ Error:', err.message); process.exit(1); }
}
seed();
