export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  isPremium?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface SiteSettings {
  siteName: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  footerText: string;
  aboutUs: string;
  privacyPolicy: string;
  googleSheetId?: string;
  heritageTitle?: string;
  heritageContent?: string;
  heritageImageUrl?: string;
}

export interface ShippingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  street: string;
  houseNumber: string;
  postalCode: string;
}

export interface OrderData extends ShippingData {
  cardHolderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  totalAmount: number;
}
