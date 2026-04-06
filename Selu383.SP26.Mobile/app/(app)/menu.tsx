import { Image } from 'expo-image';
import { Square, SquareCheck } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useCart } from '@/context/cart-context';
import { BrandColors } from '@/constants/theme';

type MenuItem = {
  name: string;
  description: string;
  price: string;
  image: number;
};

const drinks: MenuItem[] = [
  {
    name: 'Iced Latte',
    description: 'Espresso and milk served over ice for a refreshing coffee drink.',
    price: '$5.50',
    image: require('@/assets/images/iced late.png'),
  },
  {
    name: 'Supernova',
    description:
      'A unique coffee blend with a complex, balanced profile and subtle sweetness. Delicious as espresso or paired with milk.',
    price: '$7.95',
    image: require('@/assets/images/supernova.png'),
  },
  {
    name: 'Roaring Frappe',
    description:
      'Cold brew, milk, and ice blended together with a signature syrup or flavor, topped with whipped cream.',
    price: '$6.20',
    image: require('@/assets/images/roaring frappe.png'),
  },
  {
    name: 'Black & White Cold Brew',
    description: 'Cold brew made with both dark and light roast beans, finished with a drizzle of condensed milk.',
    price: '$5.15',
    image: require('@/assets/images/black white cold brew.png'),
  },
  {
    name: 'Strawberry Limeade',
    description: 'Fresh lime juice blended with strawberry puree for a refreshing, tangy drink.',
    price: '$5.00',
    image: require('@/assets/images/strawberry limeade.png'),
  },
  {
    name: 'Shaken Lemonade',
    description: 'Fresh lemon juice and simple syrup vigorously shaken for a bright, refreshing lemonade.',
    price: '$5.00',
    image: require('@/assets/images/shaken lemonade.png'),
  },
];

const sweetCrepes: MenuItem[] = [
  {
    name: 'Mannino Honey Crepe',
    description: 'A sweet crepe drizzled with Mannino honey and topped with mixed berries.',
    price: '$10.00',
    image: require('@/assets/images/mannino honey crepe.png'),
  },
  {
    name: 'Downtowner',
    description: "Strawberries and bananas wrapped in a crepe, finished with Nutella and Hershey's chocolate sauce.",
    price: '$10.75',
    image: require('@/assets/images/downtowner.png'),
  },
  {
    name: 'Funky Monkey',
    description: 'Nutella and bananas wrapped in a crepe, served with whipped cream.',
    price: '$10.00',
    image: require('@/assets/images/funky monkey.png'),
  },
  {
    name: "Le S'mores",
    description: 'Marshmallow cream and chocolate sauce inside a crepe, topped with graham cracker crumbs.',
    price: '$9.50',
    image: require('@/assets/images/le smores.png'),
  },
  {
    name: 'Strawberry Fields',
    description: "Fresh strawberries with Hershey's chocolate drizzle and a dusting of powdered sugar.",
    price: '$10.00',
    image: require('@/assets/images/strawberry fields.png'),
  },
  {
    name: 'Bonjour',
    description: 'A sweet crepe filled with syrup and cinnamon, finished with powdered sugar.',
    price: '$8.50',
    image: require('@/assets/images/bonjour.png'),
  },
  {
    name: 'Banana Foster',
    description: 'Bananas with cinnamon in a crepe, topped with a generous drizzle of caramel sauce.',
    price: '$8.95',
    image: require('@/assets/images/banana foster.png'),
  },
];

const savoryCrepes: MenuItem[] = [
  {
    name: "Matt's Scrambled Eggs",
    description: 'Scrambled eggs and melted mozzarella cheese wrapped in a crepe.',
    price: '$5.00',
    image: require('@/assets/images/matts scrambled eggs.png'),
  },
  {
    name: 'Meanie Mushroom',
    description: 'Sauteed mushrooms, mozzarella, tomato, and bacon inside a delicate crepe.',
    price: '$10.50',
    image: require('@/assets/images/meanie mushroom.png'),
  },
  {
    name: 'Turkey Club',
    description: 'Sliced turkey, bacon, spinach, and tomato wrapped in a savory crepe.',
    price: '$10.50',
    image: require('@/assets/images/turkey club.png'),
  },
  {
    name: 'Green Machine',
    description: 'Spinach, artichokes, and mozzarella cheese inside a fresh crepe.',
    price: '$10.00',
    image: require('@/assets/images/green machine.png'),
  },
  {
    name: 'Perfect Pair',
    description: 'A unique combination of bacon and Nutella wrapped in a crepe.',
    price: '$10.00',
    image: require('@/assets/images/perfect pair.png'),
  },
  {
    name: 'Crepe Fromage',
    description: 'A savory crepe filled with a blend of cheeses.',
    price: '$8.00',
    image: require('@/assets/images/crepe fromage.png'),
  },
  {
    name: 'Farmers Market Crepe',
    description: 'Turkey, spinach, and mozzarella wrapped in a savory crepe.',
    price: '$10.50',
    image: require('@/assets/images/farmers market.png'),
  },
];

const bagels: MenuItem[] = [
  {
    name: 'Travis Special',
    description: 'Cream cheese, salmon, spinach, and a fried egg served on a freshly toasted bagel.',
    price: '$14.00',
    image: require('@/assets/images/travis special.png'),
  },
  {
    name: 'Creme Brulagel',
    description: 'A toasted bagel with a caramelized sugar crust inspired by creme brulee, served with cream cheese.',
    price: '$8.00',
    image: require('@/assets/images/creme brulagle.png'),
  },
  {
    name: 'The Fancy One',
    description: 'Smoked salmon, cream cheese, and fresh dill on a toasted bagel.',
    price: '$13.00',
    image: require('@/assets/images/fancy one.png'),
  },
  {
    name: 'Breakfast Bagel',
    description: 'A toasted bagel with your choice of ham, bacon, or sausage, a fried egg, and cheddar cheese.',
    price: '$9.50',
    image: require('@/assets/images/breakfast bagel.png'),
  },
  {
    name: 'The Classic',
    description: 'A toasted bagel with cream cheese.',
    price: '$5.25',
    image: require('@/assets/images/classic.png'),
  },
];

const menuSections = [
  { title: 'Drinks', items: drinks },
  { title: 'Sweet Crepes', items: sweetCrepes },
  { title: 'Savory Crepes', items: savoryCrepes },
  { title: 'Bagels', items: bagels },
] as const;

const parsePrice = (value: string) => Number.parseFloat(value.replace(/[^0-9.]/g, '')) || 0;

export default function MenuScreen() {
  const { isInCart, toggleCartItem } = useCart();

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={styles.title}>
          Menu
        </ThemedText>
        <ThemedText style={styles.subtitle}>All menu items from the web experience.</ThemedText>

        <View style={styles.sectionList}>
          {menuSections.map((section) => (
            <View key={section.title} style={styles.sectionBlock}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                {section.title}
              </ThemedText>

              <View style={styles.list}>
                {section.items.map((item) => {
                  const isSelected = isInCart(item.name);
                  return (
                    <View key={item.name} style={styles.itemCard}>
                      <View style={styles.itemRow}>
                        <Image source={item.image} style={styles.itemImage} contentFit="cover" transition={120} />
                        <View style={styles.itemDetails}>
                          <View style={styles.itemTopRow}>
                            <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                            <ThemedText style={styles.itemPrice}>{item.price}</ThemedText>
                          </View>
                          <ThemedText style={styles.itemDescription}>{item.description}</ThemedText>
                          <Pressable
                            style={({ pressed }) => [styles.itemToggleButton, pressed && styles.itemToggleButtonPressed]}
                            onPress={() =>
                              toggleCartItem({
                                key: item.name,
                                name: item.name,
                                unitPrice: parsePrice(item.price),
                                image: item.image,
                              })
                            }
                            accessibilityRole="button"
                            accessibilityLabel={`${isSelected ? 'Remove' : 'Add'} ${item.name} ${isSelected ? 'from' : 'to'} cart`}>
                            {isSelected ? (
                              <SquareCheck color={BrandColors.primary} size={20} />
                            ) : (
                              <Square color={BrandColors.primary} size={20} />
                            )}
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BrandColors.secondary,
  },
  content: {
    padding: 20,
    paddingBottom: 28,
  },
  title: {
    color: BrandColors.darkAccent,
    marginBottom: 8,
  },
  subtitle: {
    color: BrandColors.text,
    marginBottom: 18,
  },
  sectionList: {
    gap: 16,
  },
  sectionBlock: {
    gap: 10,
  },
  sectionTitle: {
    color: BrandColors.darkAccent,
  },
  list: {
    gap: 10,
  },
  itemCard: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  itemImage: {
    width: 108,
    height: 108,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
  },
  itemDetails: {
    flex: 1,
    gap: 4,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  itemName: {
    color: BrandColors.darkAccent,
    fontWeight: '700',
    flex: 1,
  },
  itemPrice: {
    color: BrandColors.primary,
    fontWeight: '700',
  },
  itemDescription: {
    color: BrandColors.text,
    fontSize: 12,
    lineHeight: 17,
  },
  itemToggleButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
    padding: 2,
  },
  itemToggleButtonPressed: {
    opacity: 0.72,
  },
});
