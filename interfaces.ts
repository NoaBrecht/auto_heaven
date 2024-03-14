export interface Brand {
  id: string;
  name: string;
  country: string;
  logo: string;
  foundedYear: number;
  website: string
}
export interface Car {
  id: string;
  name: string;
  description: string;
  topspeed: number;
  concept_car: boolean;
  date_first_produced: Date;
  image_url: string;
  type: string;
  features: string[];
  brand: Brand
}
export { }
