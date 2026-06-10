import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Categories ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Carne fresca',    defaultDays: 4    },
  { name: 'Pescado fresco',  defaultDays: 2    },
  { name: 'Marisco',         defaultDays: 2    },
  { name: 'Verduras',        defaultDays: 7    },
  { name: 'Frutas',          defaultDays: 7    },
  { name: 'Lácteos',         defaultDays: 10   },
  { name: 'Huevos',          defaultDays: 28   },
  { name: 'Embutidos',       defaultDays: 14   },
  { name: 'Pan y bollería',  defaultDays: 5    },
  { name: 'Legumbres secas', defaultDays: 730  },
  { name: 'Conservas',       defaultDays: 1825 },
  { name: 'Congelados',      defaultDays: 180  },
  { name: 'Bebidas',         defaultDays: 365  },
];

// ─── 100 Ingredients ──────────────────────────────────────────────────────────

const INGREDIENTS = [
  // Verduras (25)
  { name: 'Cebolla',           unit: 'g',  cal: 40  },
  { name: 'Ajo',               unit: 'g',  cal: 149 },
  { name: 'Tomate',            unit: 'g',  cal: 18  },
  { name: 'Pimiento rojo',     unit: 'g',  cal: 31  },
  { name: 'Pimiento verde',    unit: 'g',  cal: 20  },
  { name: 'Zanahoria',         unit: 'g',  cal: 41  },
  { name: 'Patata',            unit: 'g',  cal: 77  },
  { name: 'Berenjena',         unit: 'g',  cal: 25  },
  { name: 'Calabacín',         unit: 'g',  cal: 17  },
  { name: 'Puerro',            unit: 'g',  cal: 61  },
  { name: 'Apio',              unit: 'g',  cal: 16  },
  { name: 'Lechuga',           unit: 'g',  cal: 15  },
  { name: 'Espinacas',         unit: 'g',  cal: 23  },
  { name: 'Acelgas',           unit: 'g',  cal: 20  },
  { name: 'Col',               unit: 'g',  cal: 25  },
  { name: 'Brócoli',           unit: 'g',  cal: 34  },
  { name: 'Coliflor',          unit: 'g',  cal: 25  },
  { name: 'Champiñones',       unit: 'g',  cal: 22  },
  { name: 'Pepino',            unit: 'g',  cal: 15  },
  { name: 'Aguacate',          unit: 'g',  cal: 160 },
  { name: 'Remolacha',         unit: 'g',  cal: 43  },
  { name: 'Judías verdes',     unit: 'g',  cal: 31  },
  { name: 'Calabaza',          unit: 'g',  cal: 26  },
  { name: 'Pimiento amarillo', unit: 'g',  cal: 27  },
  { name: 'Alcachofa',         unit: 'ud', cal: 47  },
  // Frutas (10)
  { name: 'Naranja',           unit: 'ud', cal: 47  },
  { name: 'Manzana',           unit: 'ud', cal: 52  },
  { name: 'Plátano',           unit: 'ud', cal: 89  },
  { name: 'Limón',             unit: 'ud', cal: 29  },
  { name: 'Pera',              unit: 'ud', cal: 57  },
  { name: 'Fresas',            unit: 'g',  cal: 32  },
  { name: 'Melocotón',         unit: 'ud', cal: 39  },
  { name: 'Kiwi',              unit: 'ud', cal: 61  },
  { name: 'Piña',              unit: 'g',  cal: 50  },
  { name: 'Uva',               unit: 'g',  cal: 69  },
  // Carne fresca (10)
  { name: 'Pechuga de pollo',       unit: 'g', cal: 165 },
  { name: 'Muslos de pollo',        unit: 'g', cal: 185 },
  { name: 'Ternera para guisar',    unit: 'g', cal: 135 },
  { name: 'Carne picada de ternera',unit: 'g', cal: 215 },
  { name: 'Lomo de cerdo',          unit: 'g', cal: 143 },
  { name: 'Costillas de cerdo',     unit: 'g', cal: 220 },
  { name: 'Cordero',                unit: 'g', cal: 258 },
  { name: 'Pavo',                   unit: 'g', cal: 135 },
  { name: 'Conejo',                 unit: 'g', cal: 136 },
  { name: 'Carne picada mixta',     unit: 'g', cal: 240 },
  // Pescado fresco (8)
  { name: 'Merluza',       unit: 'g', cal: 82  },
  { name: 'Salmón',        unit: 'g', cal: 208 },
  { name: 'Dorada',        unit: 'g', cal: 96  },
  { name: 'Lubina',        unit: 'g', cal: 97  },
  { name: 'Bacalao fresco',unit: 'g', cal: 82  },
  { name: 'Sardinas',      unit: 'g', cal: 208 },
  { name: 'Boquerones',    unit: 'g', cal: 131 },
  { name: 'Trucha',        unit: 'g', cal: 141 },
  // Marisco (6)
  { name: 'Gambas',       unit: 'g', cal: 85 },
  { name: 'Langostinos',  unit: 'g', cal: 90 },
  { name: 'Mejillones',   unit: 'g', cal: 86 },
  { name: 'Almejas',      unit: 'g', cal: 73 },
  { name: 'Calamar',      unit: 'g', cal: 92 },
  { name: 'Pulpo',        unit: 'g', cal: 82 },
  // Lácteos (12)
  { name: 'Leche entera',       unit: 'ml', cal: 61  },
  { name: 'Leche semidesnatada',unit: 'ml', cal: 46  },
  { name: 'Yogur natural',      unit: 'g',  cal: 59  },
  { name: 'Mantequilla',        unit: 'g',  cal: 717 },
  { name: 'Queso manchego',     unit: 'g',  cal: 392 },
  { name: 'Queso parmesano',    unit: 'g',  cal: 431 },
  { name: 'Queso feta',         unit: 'g',  cal: 264 },
  { name: 'Nata para cocinar',  unit: 'ml', cal: 195 },
  { name: 'Queso mozzarella',   unit: 'g',  cal: 280 },
  { name: 'Queso Philadelphia', unit: 'g',  cal: 342 },
  { name: 'Leche de coco',      unit: 'ml', cal: 230 },
  { name: 'Queso curado',       unit: 'g',  cal: 420 },
  // Huevos (2)
  { name: 'Huevos L', unit: 'ud', cal: 143 },
  { name: 'Huevos M', unit: 'ud', cal: 130 },
  // Embutidos (5)
  { name: 'Jamón serrano', unit: 'g', cal: 243 },
  { name: 'Chorizo',       unit: 'g', cal: 455 },
  { name: 'Salchichón',    unit: 'g', cal: 396 },
  { name: 'Lomo embuchado',unit: 'g', cal: 177 },
  { name: 'Panceta',       unit: 'g', cal: 548 },
  // Pan y bollería (3)
  { name: 'Pan de molde', unit: 'g', cal: 266 },
  { name: 'Pan de barra', unit: 'g', cal: 262 },
  { name: 'Pan rallado',  unit: 'g', cal: 395 },
  // Legumbres y cereales (8)
  { name: 'Garbanzos secos', unit: 'g', cal: 364 },
  { name: 'Lentejas',        unit: 'g', cal: 353 },
  { name: 'Judías blancas',  unit: 'g', cal: 337 },
  { name: 'Alubias rojas',   unit: 'g', cal: 337 },
  { name: 'Guisantes secos', unit: 'g', cal: 352 },
  { name: 'Arroz blanco',    unit: 'g', cal: 130 },
  { name: 'Pasta seca',      unit: 'g', cal: 371 },
  { name: 'Quinoa',          unit: 'g', cal: 368 },
  // Conservas y despensa (11)
  { name: 'Tomate triturado',   unit: 'g',  cal: 24  },
  { name: 'Bonito en aceite',   unit: 'g',  cal: 231 },
  { name: 'Sardinas en conserva',unit:'g',  cal: 208 },
  { name: 'Garbanzos cocidos',  unit: 'g',  cal: 169 },
  { name: 'Anchoas',            unit: 'g',  cal: 210 },
  { name: 'Aceitunas negras',   unit: 'g',  cal: 115 },
  { name: 'Aceitunas verdes',   unit: 'g',  cal: 145 },
  { name: 'Maíz en conserva',   unit: 'g',  cal: 86  },
  { name: 'Aceite de oliva',    unit: 'ml', cal: 884 },
  { name: 'Harina de trigo',    unit: 'g',  cal: 364 },
  { name: 'Azúcar',             unit: 'g',  cal: 387 },
];

// ─── 30 Recipes ───────────────────────────────────────────────────────────────

const RECIPES = [
  {
    id: 'seed-paella-valenciana',
    name: 'Paella valenciana',
    description: 'El plato estrella de la cocina española. Arroz sabroso con pollo, gambas y verduras, cocinado con azafrán en paellera.',
    image: 'https://www.themealdb.com/images/media/meals/9bl20p1763248192.jpg',
    prepTime: 60, servings: 4,
    steps: [
      'Sofreír el pollo troceado en aceite de oliva hasta dorarlo bien. Reservar.',
      'En la misma paellera, sofreír la cebolla y el pimiento picados durante 5 minutos.',
      'Añadir el tomate triturado y cocinar 3 minutos. Incorporar el azafrán disuelto en agua caliente.',
      'Agregar el arroz y remover para nacararlo durante 2 minutos.',
      'Verter el caldo caliente (doble que de arroz), distribuir el pollo y las gambas.',
      'Cocer a fuego vivo 8 min y luego a fuego medio 10 min sin remover. Reposar 5 min tapado.',
    ],
    ingredients: [
      { name: 'Arroz blanco', quantity: 400 },
      { name: 'Pechuga de pollo', quantity: 400 },
      { name: 'Gambas', quantity: 200 },
      { name: 'Tomate triturado', quantity: 150 },
      { name: 'Pimiento rojo', quantity: 100 },
      { name: 'Cebolla', quantity: 100 },
      { name: 'Ajo', quantity: 20 },
      { name: 'Aceite de oliva', quantity: 60 },
    ],
  },
  {
    id: 'seed-gazpacho-andaluz',
    name: 'Gazpacho andaluz',
    description: 'Sopa fría de tomate y verduras, refrescante y nutritiva. Perfecta para el verano mediterráneo.',
    image: 'https://www.themealdb.com/images/media/meals/h5qmn31763304965.jpg',
    prepTime: 20, servings: 4,
    steps: [
      'Lavar y trocear los tomates, el pepino, el pimiento y la cebolla.',
      'Remojar el pan de molde en agua fría 5 minutos y escurrirlo.',
      'Triturar todos los ingredientes con el ajo, el aceite y el vinagre hasta obtener una crema fina.',
      'Colar por el chino para conseguir una textura lisa y sedosa.',
      'Salpimentar y refrigerar al menos 2 horas antes de servir.',
      'Servir muy frío con guarnición de pepino, pimiento y cebolla en daditos.',
    ],
    ingredients: [
      { name: 'Tomate', quantity: 800 },
      { name: 'Pepino', quantity: 150 },
      { name: 'Pimiento verde', quantity: 100 },
      { name: 'Cebolla', quantity: 80 },
      { name: 'Ajo', quantity: 10 },
      { name: 'Pan de molde', quantity: 60 },
      { name: 'Aceite de oliva', quantity: 80 },
    ],
  },
  {
    id: 'seed-tortilla-espanola',
    name: 'Tortilla española',
    description: 'La tortilla de patata es el plato más reconocido de la cocina española. Dorada por fuera y jugosa por dentro.',
    image: 'https://www.themealdb.com/images/media/meals/hqaejl1695738653.jpg',
    prepTime: 35, servings: 4,
    steps: [
      'Pelar y cortar las patatas en láminas finas. Picar la cebolla finamente.',
      'Freír las patatas y la cebolla en aceite abundante a fuego medio hasta que estén tiernas. Escurrir bien.',
      'Batir los huevos con una pizca de sal en un bol grande.',
      'Mezclar las patatas escurridas con los huevos batidos y dejar reposar 2 minutos.',
      'Cuajar en una sartén antiadherente con un poco de aceite a fuego medio 4 minutos por cada lado.',
      'Dar la vuelta con la ayuda de un plato y terminar de cuajar al gusto.',
    ],
    ingredients: [
      { name: 'Patata', quantity: 600 },
      { name: 'Huevos L', quantity: 6 },
      { name: 'Cebolla', quantity: 150 },
      { name: 'Aceite de oliva', quantity: 150 },
    ],
  },
  {
    id: 'seed-pollo-ajillo',
    name: 'Pollo al ajillo',
    description: 'Pollo dorado en cazuela con ajo, vino blanco y perejil. Un clásico de los bares españoles.',
    image: 'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg',
    prepTime: 30, servings: 4,
    steps: [
      'Trocear los muslos de pollo y salpimentarlos generosamente.',
      'Dorar el pollo en aceite de oliva caliente a fuego fuerte por todos los lados. Reservar.',
      'En el mismo aceite, freír los dientes de ajo enteros y sin pelar hasta que se doren.',
      'Incorporar el pollo, añadir vino blanco y dejar evaporar el alcohol 2 minutos.',
      'Cocinar tapado a fuego medio 20 minutos hasta que el pollo esté tierno.',
      'Rectificar de sal y servir con el jugo de cocción.',
    ],
    ingredients: [
      { name: 'Muslos de pollo', quantity: 800 },
      { name: 'Ajo', quantity: 40 },
      { name: 'Aceite de oliva', quantity: 60 },
    ],
  },
  {
    id: 'seed-lentejas-estofadas',
    name: 'Lentejas estofadas con chorizo',
    description: 'Lentejas castellanas con verduras y chorizo. El plato de cuchara más reconfortante de la cocina española.',
    image: 'https://www.themealdb.com/images/media/meals/vpxyqt1511464175.jpg',
    prepTime: 50, servings: 4,
    steps: [
      'Picar la cebolla, la zanahoria y el ajo finamente.',
      'Sofreír las verduras en aceite de oliva a fuego medio 8 minutos hasta que estén blandas.',
      'Añadir el chorizo en rodajas y rehogar 2 minutos.',
      'Incorporar el tomate triturado, el pimentón y remover bien.',
      'Agregar las lentejas y cubrir con agua fría. Cocinar a fuego medio 35 minutos.',
      'Rectificar de sal. Triturar una cucharada de lentejas para espesar el caldo si se desea.',
    ],
    ingredients: [
      { name: 'Lentejas', quantity: 400 },
      { name: 'Chorizo', quantity: 150 },
      { name: 'Cebolla', quantity: 150 },
      { name: 'Zanahoria', quantity: 150 },
      { name: 'Tomate triturado', quantity: 200 },
      { name: 'Ajo', quantity: 15 },
      { name: 'Aceite de oliva', quantity: 40 },
    ],
  },
  {
    id: 'seed-merluza-salsa-verde',
    name: 'Merluza en salsa verde',
    description: 'Filetes de merluza cocinados en una deliciosa salsa de ajo, perejil y vino blanco con almejas.',
    image: 'https://www.themealdb.com/images/media/meals/ysxwuq1487323065.jpg',
    prepTime: 25, servings: 2,
    steps: [
      'Salpimentar los filetes de merluza y enharinarlos ligeramente.',
      'Calentar aceite en una cazuela y dorar el ajo picado sin que se queme.',
      'Añadir la harina y tostar 1 minuto. Verter el vino blanco y dejar evaporar.',
      'Incorporar el caldo de pescado poco a poco removiendo para que no haya grumos.',
      'Añadir la merluza y las almejas. Cocinar 8 minutos tapado a fuego suave.',
      'Espolvorear perejil picado y servir caliente.',
    ],
    ingredients: [
      { name: 'Merluza', quantity: 400 },
      { name: 'Almejas', quantity: 200 },
      { name: 'Ajo', quantity: 20 },
      { name: 'Harina de trigo', quantity: 20 },
      { name: 'Aceite de oliva', quantity: 40 },
    ],
  },
  {
    id: 'seed-ensalada-caprese',
    name: 'Ensalada caprese',
    description: 'La combinación más sencilla y elegante: tomate maduro, mozzarella fresca y albahaca con aceite de oliva.',
    image: 'https://www.themealdb.com/images/media/meals/6cskio1763338156.jpg',
    prepTime: 10, servings: 2,
    steps: [
      'Cortar el tomate y la mozzarella en rodajas de 1 cm de grosor.',
      'Intercalar las rodajas de tomate y mozzarella en el plato.',
      'Añadir las hojas de albahaca fresca.',
      'Aliñar con aceite de oliva virgen extra y sal en escamas.',
      'Servir inmediatamente a temperatura ambiente.',
    ],
    ingredients: [
      { name: 'Tomate', quantity: 300 },
      { name: 'Queso mozzarella', quantity: 200 },
      { name: 'Aceite de oliva', quantity: 30 },
    ],
  },
  {
    id: 'seed-pasta-carbonara',
    name: 'Pasta carbonara',
    description: 'El auténtico carbonara romano: pasta, huevo, queso parmesano y panceta. Sin nata, sin secretos.',
    image: 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg',
    prepTime: 20, servings: 2,
    steps: [
      'Cocer la pasta en agua muy salada hasta que esté al dente. Reservar un vaso del agua de cocción.',
      'Freír la panceta en su propia grasa hasta que quede crujiente.',
      'Batir los huevos con el queso parmesano rallado y una generosa cantidad de pimienta negra.',
      'Fuera del fuego, mezclar la pasta escurrida con la panceta.',
      'Añadir la mezcla de huevo rápidamente, removiendo y añadiendo agua de cocción poco a poco.',
      'La salsa debe quedar cremosa, no cuajada. Servir inmediatamente.',
    ],
    ingredients: [
      { name: 'Pasta seca', quantity: 200 },
      { name: 'Panceta', quantity: 100 },
      { name: 'Huevos L', quantity: 3 },
      { name: 'Queso parmesano', quantity: 60 },
    ],
  },
  {
    id: 'seed-espaguetis-bolonesa',
    name: 'Espaguetis a la boloñesa',
    description: 'Ragú de carne lento con tomate, zanahoria y apio. La receta italiana que enamoró al mundo.',
    image: 'https://www.themealdb.com/images/media/meals/sutysw1468247559.jpg',
    prepTime: 50, servings: 4,
    steps: [
      'Picar finamente la cebolla, la zanahoria y el apio para el sofrito.',
      'Rehogar las verduras en aceite de oliva a fuego bajo 10 minutos hasta que estén muy tiernas.',
      'Subir el fuego y añadir la carne picada. Dorar bien rompiéndola con la espátula.',
      'Incorporar el vino tinto y dejar evaporar. Añadir el tomate triturado.',
      'Cocinar el ragú a fuego muy lento durante 30 minutos removiendo ocasionalmente.',
      'Cocer los espaguetis al dente y mezclar con la salsa. Servir con parmesano rallado.',
    ],
    ingredients: [
      { name: 'Pasta seca', quantity: 400 },
      { name: 'Carne picada de ternera', quantity: 400 },
      { name: 'Tomate triturado', quantity: 400 },
      { name: 'Cebolla', quantity: 100 },
      { name: 'Zanahoria', quantity: 80 },
      { name: 'Apio', quantity: 60 },
      { name: 'Ajo', quantity: 15 },
      { name: 'Aceite de oliva', quantity: 40 },
    ],
  },
  {
    id: 'seed-crema-calabaza',
    name: 'Crema de calabaza',
    description: 'Crema suave y aterciopelada de calabaza con un toque de leche de coco. Reconfortante y saludable.',
    image: 'https://www.themealdb.com/images/media/meals/1brbso1763585098.jpg',
    prepTime: 40, servings: 4,
    steps: [
      'Pelar y trocear la calabaza en cubos. Picar la cebolla y la zanahoria.',
      'Rehogar la cebolla en mantequilla 5 minutos. Añadir la zanahoria y cocinar 3 minutos más.',
      'Incorporar la calabaza y cubrir con agua o caldo de verduras.',
      'Cocinar a fuego medio 25 minutos hasta que la calabaza esté muy blanda.',
      'Triturar con batidora de mano hasta obtener una crema fina.',
      'Añadir la leche de coco, salpimentar y servir con un hilo de aceite de oliva.',
    ],
    ingredients: [
      { name: 'Calabaza', quantity: 700 },
      { name: 'Cebolla', quantity: 150 },
      { name: 'Zanahoria', quantity: 150 },
      { name: 'Leche de coco', quantity: 200 },
      { name: 'Mantequilla', quantity: 30 },
      { name: 'Aceite de oliva', quantity: 30 },
    ],
  },
  {
    id: 'seed-gambas-pil-pil',
    name: 'Gambas al pil-pil',
    description: 'Gambas salteadas con ajo y guindilla en aceite de oliva. Tapa imprescindible de la gastronomía española.',
    image: 'https://www.themealdb.com/images/media/meals/1525873040.jpg',
    prepTime: 10, servings: 2,
    steps: [
      'Pelar las gambas dejando la cola y secarlas con papel de cocina.',
      'Calentar el aceite de oliva en una cazuela de barro o sartén.',
      'Freír los ajos laminados a fuego medio sin que se doren.',
      'Añadir las gambas y la guindilla. Saltear a fuego vivo 2-3 minutos.',
      'Salpimentar y servir inmediatamente en la misma cazuela burbujeando.',
    ],
    ingredients: [
      { name: 'Gambas', quantity: 300 },
      { name: 'Ajo', quantity: 30 },
      { name: 'Aceite de oliva', quantity: 80 },
    ],
  },
  {
    id: 'seed-arroz-con-leche',
    name: 'Arroz con leche',
    description: 'Postre tradicional español de arroz cremoso cocido en leche con canela y limón. Servido frío con canela en polvo.',
    image: 'https://www.themealdb.com/images/media/meals/5r5rvx1763287943.jpg',
    prepTime: 45, servings: 4,
    steps: [
      'Hervir la leche con la piel de limón y una ramita de canela durante 5 minutos. Colar y reservar.',
      'Cocer el arroz en agua 5 minutos, escurrir y reservar.',
      'Añadir el arroz a la leche caliente y cocinar a fuego muy lento 30 minutos removiendo constantemente.',
      'Incorporar el azúcar y la mantequilla cuando el arroz esté cremoso.',
      'Verter en cuencos individuales y dejar enfriar a temperatura ambiente.',
      'Refrigerar al menos 2 horas y espolvorear con canela en polvo antes de servir.',
    ],
    ingredients: [
      { name: 'Arroz blanco', quantity: 150 },
      { name: 'Leche entera', quantity: 1000 },
      { name: 'Azúcar', quantity: 100 },
      { name: 'Limón', quantity: 1 },
      { name: 'Mantequilla', quantity: 20 },
    ],
  },
  {
    id: 'seed-croquetas-jamon',
    name: 'Croquetas de jamón',
    description: 'Croquetas caseras con bechamel cremosa y jamón serrano. Crujientes por fuera, fundentes por dentro.',
    image: 'https://www.themealdb.com/images/media/meals/ul2uy31764794321.jpg',
    prepTime: 60, servings: 4,
    steps: [
      'Derretir la mantequilla y añadir la harina. Tostar 2 minutos a fuego medio removiendo.',
      'Añadir la leche caliente poco a poco sin dejar de remover para evitar grumos.',
      'Incorporar el jamón picado fino y cocinar la bechamel 15 minutos hasta que se despegue de las paredes.',
      'Extender en una fuente, tapar con film a contacto y dejar enfriar en la nevera 4 horas mínimo.',
      'Formar las croquetas, pasarlas por huevo batido y pan rallado.',
      'Freír en aceite abundante a 180°C hasta que estén doradas. Escurrir en papel absorbente.',
    ],
    ingredients: [
      { name: 'Jamón serrano', quantity: 200 },
      { name: 'Leche entera', quantity: 600 },
      { name: 'Harina de trigo', quantity: 100 },
      { name: 'Mantequilla', quantity: 80 },
      { name: 'Huevos L', quantity: 2 },
      { name: 'Pan rallado', quantity: 150 },
      { name: 'Aceite de oliva', quantity: 200 },
    ],
  },
  {
    id: 'seed-pisto-manchego',
    name: 'Pisto manchego',
    description: 'El ratatouille español. Verduras de temporada cocinadas lentamente en aceite de oliva.',
    image: 'https://www.themealdb.com/images/media/meals/wrpwuu1511786491.jpg',
    prepTime: 45, servings: 4,
    steps: [
      'Cortar todas las verduras en dados similares de 1-2 cm.',
      'Sofreír la cebolla en aceite de oliva 8 minutos a fuego medio.',
      'Añadir el pimiento rojo y el pimiento verde, cocinar 5 minutos.',
      'Incorporar la berenjena y el calabacín. Cocinar tapado 15 minutos.',
      'Añadir el tomate troceado, subir el fuego y cocinar destapado 10 minutos.',
      'Rectificar de sal y azúcar para equilibrar la acidez. Servir caliente o templado.',
    ],
    ingredients: [
      { name: 'Calabacín', quantity: 300 },
      { name: 'Berenjena', quantity: 300 },
      { name: 'Pimiento rojo', quantity: 150 },
      { name: 'Pimiento verde', quantity: 150 },
      { name: 'Tomate', quantity: 300 },
      { name: 'Cebolla', quantity: 150 },
      { name: 'Aceite de oliva', quantity: 60 },
    ],
  },
  {
    id: 'seed-salmon-horno',
    name: 'Salmón al horno con limón',
    description: 'Lomo de salmón al horno con limón y hierbas aromáticas. Listo en 25 minutos y lleno de omega-3.',
    image: 'https://www.themealdb.com/images/media/meals/ikizdm1763760862.jpg',
    prepTime: 25, servings: 2,
    steps: [
      'Precalentar el horno a 200°C con calor arriba y abajo.',
      'Colocar el salmón en una fuente de horno forrada con papel vegetal.',
      'Aliñar con aceite de oliva, zumo de limón, sal y pimienta.',
      'Colocar rodajas de limón por encima.',
      'Hornear 15-18 minutos hasta que el salmón esté opaco pero todavía jugoso en el centro.',
      'Servir inmediatamente con la guarnición deseada.',
    ],
    ingredients: [
      { name: 'Salmón', quantity: 400 },
      { name: 'Limón', quantity: 2 },
      { name: 'Aceite de oliva', quantity: 30 },
    ],
  },
  {
    id: 'seed-ensalada-griega',
    name: 'Ensalada griega',
    description: 'Ensalada mediterránea con tomate, pepino, queso feta y aceitunas. Fresca, colorida y muy saludable.',
    image: 'https://www.themealdb.com/images/media/meals/k29viq1585565980.jpg',
    prepTime: 15, servings: 2,
    steps: [
      'Cortar el tomate en gajos y el pepino en rodajas gruesas.',
      'Cortar la cebolla en aros finos y el pimiento en tiras.',
      'Disponer todo en una fuente con las aceitunas.',
      'Colocar el queso feta en un bloque encima o desmenuzado.',
      'Aliñar con aceite de oliva virgen extra, orégano y sal.',
      'Servir inmediatamente sin mezclar para respetar las texturas.',
    ],
    ingredients: [
      { name: 'Tomate', quantity: 300 },
      { name: 'Pepino', quantity: 200 },
      { name: 'Queso feta', quantity: 150 },
      { name: 'Aceitunas negras', quantity: 80 },
      { name: 'Cebolla', quantity: 80 },
      { name: 'Pimiento verde', quantity: 80 },
      { name: 'Aceite de oliva', quantity: 40 },
    ],
  },
  {
    id: 'seed-revuelto-champinones',
    name: 'Revuelto de champiñones y gambas',
    description: 'Huevos revueltos con champiñones salteados y gambas. Rápido, sabroso y muy nutritivo.',
    image: 'https://www.themealdb.com/images/media/meals/uuuspp1511297945.jpg',
    prepTime: 20, servings: 2,
    steps: [
      'Limpiar y laminar los champiñones. Pelar las gambas.',
      'Saltear los champiñones en aceite de oliva a fuego fuerte hasta que suelten el agua.',
      'Añadir el ajo picado y las gambas. Saltear 2 minutos.',
      'Bajar el fuego a mínimo y añadir los huevos batidos con sal.',
      'Remover suavemente con espátula hasta que los huevos cuajen a gusto (muy jugosos mejor).',
      'Servir inmediatamente sobre tostadas o solos.',
    ],
    ingredients: [
      { name: 'Champiñones', quantity: 300 },
      { name: 'Gambas', quantity: 150 },
      { name: 'Huevos L', quantity: 4 },
      { name: 'Ajo', quantity: 15 },
      { name: 'Aceite de oliva', quantity: 30 },
    ],
  },
  {
    id: 'seed-pollo-asado',
    name: 'Pollo asado al romero y ajo',
    description: 'Pollo entero asado al horno con ajo, romero y patatas. El asado dominguero por excelencia.',
    image: 'https://www.themealdb.com/images/media/meals/nlxald1764112200.jpg',
    prepTime: 90, servings: 4,
    steps: [
      'Precalentar el horno a 200°C. Limpiar y secar el pollo.',
      'Mezclar aceite de oliva con ajo picado, sal y pimienta. Frotar generosamente el pollo por dentro y fuera.',
      'Introducir las hierbas en el interior del pollo y atar las patas.',
      'Colocar las patatas en gajos alrededor del pollo en la bandeja. Añadir un chorro de aceite.',
      'Asar 20 minutos a 200°C, luego bajar a 180°C y continuar 50 minutos más.',
      'Dejar reposar 10 minutos antes de trinchar para que los jugos se redistribuyan.',
    ],
    ingredients: [
      { name: 'Pechuga de pollo', quantity: 1000 },
      { name: 'Patata', quantity: 600 },
      { name: 'Ajo', quantity: 30 },
      { name: 'Aceite de oliva', quantity: 60 },
    ],
  },
  {
    id: 'seed-fabada-asturiana',
    name: 'Fabada asturiana',
    description: 'El plato de cuchara más contundente de España. Alubias blancas con el compango asturiano.',
    image: 'https://www.themealdb.com/images/media/meals/tnwy8m1628770384.jpg',
    prepTime: 150, servings: 6,
    steps: [
      'Poner las alubias en remojo en agua fría la noche anterior.',
      'Colocar las alubias con el agua de remojo en una cazuela grande y llevar a ebullición.',
      'Añadir el chorizo, la panceta y la cebolla entera. Bajar el fuego al mínimo.',
      'Cocinar a fuego muy lento 2 horas, "asustando" las alubias tres veces con agua fría.',
      'Retirar la carne, desmenuzarla y devolverla al guiso.',
      'Rectificar de sal y dejar reposar 15 minutos antes de servir.',
    ],
    ingredients: [
      { name: 'Alubias rojas', quantity: 500 },
      { name: 'Chorizo', quantity: 200 },
      { name: 'Panceta', quantity: 150 },
      { name: 'Cebolla', quantity: 100 },
    ],
  },
  {
    id: 'seed-salmorejo',
    name: 'Salmorejo cordobés',
    description: 'Crema fría de tomate con pan y ajo, más densa que el gazpacho. Origen cordobés y sabor inimitable.',
    image: 'https://www.themealdb.com/images/media/meals/stpuws1511191310.jpg',
    prepTime: 15, servings: 4,
    steps: [
      'Escaldar y pelar los tomates, triturarlos con la batidora.',
      'Remojar el pan en agua fría y escurrirlo bien.',
      'Triturar el pan con el tomate, el ajo y la sal hasta obtener una crema fina.',
      'Añadir el aceite de oliva en hilo fino mientras se sigue triturando.',
      'Colar la crema y ajustar de sal y vinagre.',
      'Refrigerar 2 horas y servir con huevo duro rallado y jamón en tiras.',
    ],
    ingredients: [
      { name: 'Tomate', quantity: 800 },
      { name: 'Pan de molde', quantity: 150 },
      { name: 'Ajo', quantity: 10 },
      { name: 'Aceite de oliva', quantity: 100 },
    ],
  },
  {
    id: 'seed-dorada-sal',
    name: 'Dorada a la sal',
    description: 'Dorada entera horneada en costra de sal. Técnica ancestral que concentra todos los jugos del pescado.',
    image: 'https://www.themealdb.com/images/media/meals/tqd7s21763780609.jpg',
    prepTime: 35, servings: 2,
    steps: [
      'Precalentar el horno a 220°C. Preparar una fuente de horno.',
      'Cubrir la base de la fuente con una capa generosa de sal gorda.',
      'Colocar la dorada entera (sin escamar) sobre la sal. Cubrir completamente con más sal gorda.',
      'Humedecer ligeramente la sal con agua para que compacte.',
      'Hornear 25-30 minutos según el tamaño del pescado.',
      'Romper la costra de sal en la mesa, retirarla y servir el pescado inmediatamente.',
    ],
    ingredients: [
      { name: 'Dorada', quantity: 600 },
      { name: 'Aceite de oliva', quantity: 20 },
      { name: 'Limón', quantity: 1 },
    ],
  },
  {
    id: 'seed-pimientos-rellenos',
    name: 'Pimientos rellenos de carne',
    description: 'Pimientos rojos rellenos de carne picada con arroz y tomate, horneados con queso gratinado.',
    image: 'https://www.themealdb.com/images/media/meals/0ljvc51763248075.jpg',
    prepTime: 65, servings: 4,
    steps: [
      'Cortar la parte superior de los pimientos y vaciarlos. Salpimentar por dentro.',
      'Sofreír la cebolla y el ajo picados 5 minutos. Añadir la carne picada y dorarla bien.',
      'Incorporar el tomate triturado y el arroz. Cocinar 5 minutos.',
      'Rellenar los pimientos con la mezcla de carne. Colocarlos en una fuente de horno.',
      'Cubrir con queso rallado y hornear a 180°C durante 40 minutos.',
      'Servir calientes con el jugo de cocción.',
    ],
    ingredients: [
      { name: 'Pimiento rojo', quantity: 600 },
      { name: 'Carne picada mixta', quantity: 400 },
      { name: 'Arroz blanco', quantity: 100 },
      { name: 'Tomate triturado', quantity: 200 },
      { name: 'Cebolla', quantity: 100 },
      { name: 'Ajo', quantity: 15 },
      { name: 'Queso manchego', quantity: 80 },
    ],
  },
  {
    id: 'seed-arroz-negro',
    name: 'Arroz negro con sepia',
    description: 'Arroz negro con tinta de calamar y sepia. Un plato de mar que enamora a primera vista.',
    image: 'https://www.themealdb.com/images/media/meals/yxiilf1763759428.jpg',
    prepTime: 50, servings: 4,
    steps: [
      'Limpiar y trocear la sepia reservando las bolsas de tinta.',
      'Sofreír la cebolla y el ajo en aceite. Añadir la sepia y dorar 5 minutos.',
      'Incorporar el tomate triturado y cocinar 5 minutos más.',
      'Añadir el arroz y nacararlo 2 minutos. Disolver la tinta de sepia en el caldo caliente.',
      'Verter el caldo con tinta y cocinar a fuego medio 18 minutos sin remover.',
      'Dejar reposar 5 minutos y servir con alioli casero.',
    ],
    ingredients: [
      { name: 'Arroz blanco', quantity: 400 },
      { name: 'Calamar', quantity: 500 },
      { name: 'Cebolla', quantity: 150 },
      { name: 'Ajo', quantity: 20 },
      { name: 'Tomate triturado', quantity: 150 },
      { name: 'Aceite de oliva', quantity: 60 },
    ],
  },
  {
    id: 'seed-crema-zanahorias',
    name: 'Crema de zanahorias con leche de coco',
    description: 'Crema suave y levemente dulce de zanahoria con un toque exótico de leche de coco y jengibre.',
    image: 'https://www.themealdb.com/images/media/meals/jcr46d1614763831.jpg',
    prepTime: 35, servings: 4,
    steps: [
      'Pelar y trocear las zanahorias. Picar la cebolla.',
      'Rehogar la cebolla en aceite de oliva 5 minutos. Añadir las zanahorias.',
      'Cubrir con agua o caldo de verduras y cocinar 25 minutos a fuego medio.',
      'Triturar hasta obtener una crema muy fina.',
      'Añadir la leche de coco y calentar 2 minutos. Ajustar la consistencia con más caldo.',
      'Rectificar de sal y servir con semillas de sésamo y un hilo de aceite.',
    ],
    ingredients: [
      { name: 'Zanahoria', quantity: 600 },
      { name: 'Cebolla', quantity: 150 },
      { name: 'Leche de coco', quantity: 200 },
      { name: 'Aceite de oliva', quantity: 30 },
    ],
  },
  {
    id: 'seed-hamburguesa-casera',
    name: 'Hamburguesa casera',
    description: 'Hamburguesa artesanal de ternera con queso manchego, lechuga y tomate en pan tostado.',
    image: 'https://www.themealdb.com/images/media/meals/lgmnff1763789847.jpg',
    prepTime: 25, servings: 2,
    steps: [
      'Mezclar la carne picada con sal, pimienta y cebolla finamente picada.',
      'Formar dos hamburguesas de 200g compactas. Hacer una ligera hendidura en el centro.',
      'Calentar la plancha al máximo y cocinar las hamburguesas 3-4 minutos por lado.',
      'Tostar el pan de molde en la plancha. Fundir el queso encima de la carne los últimos 2 minutos.',
      'Montar la hamburguesa con lechuga, tomate en rodajas y la carne con queso.',
      'Servir inmediatamente acompañada de patatas fritas.',
    ],
    ingredients: [
      { name: 'Carne picada de ternera', quantity: 400 },
      { name: 'Pan de molde', quantity: 120 },
      { name: 'Queso manchego', quantity: 60 },
      { name: 'Lechuga', quantity: 60 },
      { name: 'Tomate', quantity: 100 },
      { name: 'Cebolla', quantity: 60 },
    ],
  },
  {
    id: 'seed-pollo-curry',
    name: 'Pollo al curry con arroz basmati',
    description: 'Curry suave de pollo con leche de coco y especias aromáticas. Servido sobre arroz blanco esponjoso.',
    image: 'https://www.themealdb.com/images/media/meals/vwrpps1503068729.jpg',
    prepTime: 35, servings: 4,
    steps: [
      'Trocear el pollo en dados. Picar la cebolla y el ajo.',
      'Sofreír la cebolla en aceite hasta que esté dorada. Añadir el ajo y el curry en polvo.',
      'Incorporar el pollo y sellarlo bien por todos lados.',
      'Añadir la leche de coco y el tomate triturado. Remover bien.',
      'Cocinar a fuego medio 20 minutos hasta que el pollo esté tierno y la salsa haya espesado.',
      'Servir sobre arroz blanco con cilantro fresco.',
    ],
    ingredients: [
      { name: 'Pechuga de pollo', quantity: 600 },
      { name: 'Leche de coco', quantity: 400 },
      { name: 'Tomate triturado', quantity: 200 },
      { name: 'Cebolla', quantity: 150 },
      { name: 'Ajo', quantity: 20 },
      { name: 'Arroz blanco', quantity: 300 },
      { name: 'Aceite de oliva', quantity: 30 },
    ],
  },
  {
    id: 'seed-berenjenas-rellenas',
    name: 'Berenjenas rellenas',
    description: 'Mitades de berenjena rellenas de carne picada con tomate y gratinadas con queso manchego.',
    image: 'https://www.themealdb.com/images/media/meals/8c8m4q1763791156.jpg',
    prepTime: 55, servings: 4,
    steps: [
      'Partir las berenjenas por la mitad, hacer cortes en la pulpa y hornear 20 min a 180°C.',
      'Vaciar la pulpa con cuidado dejando una barquita. Picar la pulpa extraída.',
      'Sofreír cebolla, ajo y la pulpa de berenjena. Añadir la carne y dorarla.',
      'Incorporar el tomate triturado y cocinar 10 minutos. Rellenar las barquitas.',
      'Cubrir con queso manchego rallado.',
      'Gratinar en el horno a 200°C durante 10 minutos hasta que el queso esté dorado.',
    ],
    ingredients: [
      { name: 'Berenjena', quantity: 800 },
      { name: 'Carne picada de ternera', quantity: 400 },
      { name: 'Tomate triturado', quantity: 200 },
      { name: 'Queso manchego', quantity: 100 },
      { name: 'Cebolla', quantity: 100 },
      { name: 'Ajo', quantity: 15 },
      { name: 'Aceite de oliva', quantity: 40 },
    ],
  },
  {
    id: 'seed-patatas-horno',
    name: 'Patatas al horno con pimentón',
    description: 'Patatas rustidas al horno con ajo, pimentón de la Vera y aceite de oliva. Guarnición perfecta para cualquier plato.',
    image: 'https://www.themealdb.com/images/media/meals/1550441882.jpg',
    prepTime: 45, servings: 4,
    steps: [
      'Precalentar el horno a 200°C. Lavar bien las patatas sin pelar.',
      'Cortar en gajos de tamaño similar para que se cocinen de manera uniforme.',
      'En un bol grande mezclar las patatas con aceite, ajo picado, pimentón, sal y pimienta.',
      'Extender en una bandeja de horno en una sola capa.',
      'Hornear 35-40 minutos dando la vuelta a mitad de cocción.',
      'Servir crujientes y doradas como guarnición o tapa.',
    ],
    ingredients: [
      { name: 'Patata', quantity: 800 },
      { name: 'Aceite de oliva', quantity: 60 },
      { name: 'Ajo', quantity: 20 },
    ],
  },
  {
    id: 'seed-ensalada-garbanzos',
    name: 'Ensalada de garbanzos mediterránea',
    description: 'Ensalada fresca y proteica con garbanzos cocidos, verduras frescas y aceitunas. Perfecta como plato único.',
    image: 'https://www.themealdb.com/images/media/meals/tvtxpq1511464705.jpg',
    prepTime: 15, servings: 2,
    steps: [
      'Escurrir y aclarar los garbanzos en conserva con agua fría.',
      'Cortar el tomate en dados, el pepino en rodajas y la cebolla en juliana.',
      'Mezclar los garbanzos con las verduras y las aceitunas en una ensaladera.',
      'Aliñar con aceite de oliva, zumo de limón, sal, comino y pimentón.',
      'Mezclar bien y dejar reposar 10 minutos para que los sabores se integren.',
      'Servir a temperatura ambiente o fría.',
    ],
    ingredients: [
      { name: 'Garbanzos cocidos', quantity: 400 },
      { name: 'Tomate', quantity: 200 },
      { name: 'Pepino', quantity: 150 },
      { name: 'Cebolla', quantity: 80 },
      { name: 'Aceitunas negras', quantity: 60 },
      { name: 'Aceite de oliva', quantity: 40 },
      { name: 'Limón', quantity: 1 },
    ],
  },
  {
    id: 'seed-tortilla-espinacas',
    name: 'Tortilla de espinacas y ajo',
    description: 'Tortilla ligera y nutritiva con espinacas frescas salteadas con ajo. Perfecta para cenar.',
    image: 'https://www.themealdb.com/images/media/meals/wspuvp1511303478.jpg',
    prepTime: 20, servings: 2,
    steps: [
      'Lavar las espinacas y secarlas. Picar el ajo finamente.',
      'Saltear el ajo en aceite de oliva y añadir las espinacas. Cocinar 3 minutos hasta que se reduzcan.',
      'Escurrir bien el exceso de agua de las espinacas.',
      'Batir los huevos con sal y pimienta. Mezclar con las espinacas templadas.',
      'Cuajar en sartén antiadherente a fuego medio 3 minutos. Dar la vuelta y cocinar 2 minutos más.',
      'Servir caliente o a temperatura ambiente.',
    ],
    ingredients: [
      { name: 'Espinacas', quantity: 300 },
      { name: 'Huevos L', quantity: 4 },
      { name: 'Ajo', quantity: 15 },
      { name: 'Aceite de oliva', quantity: 30 },
    ],
  },
  {
    id: 'seed-crema-catalana',
    name: 'Crema catalana',
    description: 'El postre catalán por excelencia. Crema de yemas con vainilla y limón coronada con una fina capa de azúcar caramelizado.',
    image: 'https://www.themealdb.com/images/media/meals/uryqru1511798039.jpg',
    prepTime: 40, servings: 4,
    steps: [
      'Calentar la leche con la piel de limón y la vainilla sin que llegue a hervir. Colar.',
      'Batir las yemas con el azúcar hasta blanquear. Añadir la maicena y mezclar bien.',
      'Incorporar la leche caliente poco a poco sobre las yemas sin dejar de remover.',
      'Cocer a fuego medio removiendo hasta que la crema espese y cubra la cuchara.',
      'Distribuir en cazuelitas de barro y dejar enfriar. Refrigerar 3 horas.',
      'Justo antes de servir, espolvorear azúcar y quemar con soplete o plancha caliente.',
    ],
    ingredients: [
      { name: 'Leche entera', quantity: 600 },
      { name: 'Huevos L', quantity: 4 },
      { name: 'Azúcar', quantity: 120 },
      { name: 'Limón', quantity: 1 },
      { name: 'Harina de trigo', quantity: 20 },
    ],
  },
];

// ─── Pantry items for demo user ───────────────────────────────────────────────

function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * 86_400_000);
}

interface PantryItemSeed {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  ingredientName?: string;
  expiresAt?: Date;
}

const PANTRY_ITEMS: PantryItemSeed[] = [
  // Verduras
  { name: 'Cebollas', quantity: 1000, unit: 'g',  category: 'Verduras',      ingredientName: 'Cebolla',           expiresAt: daysFromNow(10) },
  { name: 'Cabeza de ajos', quantity: 150, unit: 'g', category: 'Verduras',  ingredientName: 'Ajo',               expiresAt: daysFromNow(20) },
  { name: 'Tomates pera', quantity: 800, unit: 'g',   category: 'Verduras',  ingredientName: 'Tomate',            expiresAt: daysFromNow(5)  },
  { name: 'Pimientos rojos', quantity: 600, unit: 'g', category: 'Verduras', ingredientName: 'Pimiento rojo',     expiresAt: daysFromNow(6)  },
  { name: 'Zanahorias', quantity: 500, unit: 'g',      category: 'Verduras', ingredientName: 'Zanahoria',         expiresAt: daysFromNow(12) },
  { name: 'Patatas', quantity: 2000, unit: 'g',        category: 'Verduras', ingredientName: 'Patata',            expiresAt: daysFromNow(30) },
  { name: 'Espinacas baby', quantity: 0, unit: 'g',    category: 'Verduras', ingredientName: 'Espinacas',         expiresAt: daysFromNow(2)  },
  { name: 'Champiñones', quantity: 250, unit: 'g',     category: 'Verduras', ingredientName: 'Champiñones',       expiresAt: daysFromNow(4)  },
  { name: 'Aguacates', quantity: 300, unit: 'g',       category: 'Verduras', ingredientName: 'Aguacate',          expiresAt: daysFromNow(3)  },
  { name: 'Calabacines', quantity: 400, unit: 'g',     category: 'Verduras', ingredientName: 'Calabacín',         expiresAt: daysFromNow(7)  },
  { name: 'Berenjenas', quantity: 0, unit: 'g',        category: 'Verduras', ingredientName: 'Berenjena',         expiresAt: daysFromNow(1)  },
  // Frutas
  { name: 'Limones', quantity: 300, unit: 'g',         category: 'Frutas',   ingredientName: 'Limón',             expiresAt: daysFromNow(14) },
  { name: 'Naranjas', quantity: 1000, unit: 'g',       category: 'Frutas',   ingredientName: 'Naranja',           expiresAt: daysFromNow(10) },
  { name: 'Manzanas', quantity: 600, unit: 'g',        category: 'Frutas',   ingredientName: 'Manzana',           expiresAt: daysFromNow(8)  },
  { name: 'Plátanos', quantity: 0, unit: 'g',          category: 'Frutas',   ingredientName: 'Plátano',           expiresAt: daysFromNow(2)  },
  // Carnes
  { name: 'Pechuga de pollo', quantity: 600, unit: 'g',    category: 'Carne fresca', ingredientName: 'Pechuga de pollo',       expiresAt: daysFromNow(3) },
  { name: 'Carne picada mixta', quantity: 400, unit: 'g',  category: 'Carne fresca', ingredientName: 'Carne picada mixta',     expiresAt: daysFromNow(2) },
  { name: 'Muslos de pollo', quantity: 0, unit: 'g',       category: 'Carne fresca', ingredientName: 'Muslos de pollo',        expiresAt: daysFromNow(1) },
  { name: 'Lomo de cerdo', quantity: 300, unit: 'g',       category: 'Carne fresca', ingredientName: 'Lomo de cerdo',          expiresAt: daysFromNow(3) },
  // Pescado
  { name: 'Salmón fresco', quantity: 400, unit: 'g',   category: 'Pescado fresco', ingredientName: 'Salmón',       expiresAt: daysFromNow(2) },
  { name: 'Merluza', quantity: 0, unit: 'g',           category: 'Pescado fresco', ingredientName: 'Merluza',      expiresAt: daysFromNow(1) },
  // Marisco
  { name: 'Gambas frescas', quantity: 500, unit: 'g',  category: 'Marisco',  ingredientName: 'Gambas',            expiresAt: daysFromNow(2)  },
  { name: 'Mejillones', quantity: 0, unit: 'g',        category: 'Marisco',  ingredientName: 'Mejillones',        expiresAt: daysFromNow(1)  },
  { name: 'Almejas', quantity: 200, unit: 'g',         category: 'Marisco',  ingredientName: 'Almejas',           expiresAt: daysFromNow(2)  },
  // Lácteos
  { name: 'Leche entera', quantity: 2000, unit: 'ml',  category: 'Lácteos',  ingredientName: 'Leche entera',      expiresAt: daysFromNow(7)  },
  { name: 'Mantequilla', quantity: 250, unit: 'g',     category: 'Lácteos',  ingredientName: 'Mantequilla',       expiresAt: daysFromNow(30) },
  { name: 'Queso manchego', quantity: 300, unit: 'g',  category: 'Lácteos',  ingredientName: 'Queso manchego',    expiresAt: daysFromNow(20) },
  { name: 'Nata para cocinar', quantity: 500, unit: 'ml', category: 'Lácteos', ingredientName: 'Nata para cocinar', expiresAt: daysFromNow(10) },
  { name: 'Queso mozzarella', quantity: 0, unit: 'g',  category: 'Lácteos',  ingredientName: 'Queso mozzarella',  expiresAt: daysFromNow(2)  },
  { name: 'Yogures naturales', quantity: 400, unit: 'g', category: 'Lácteos', ingredientName: 'Yogur natural',    expiresAt: daysFromNow(8)  },
  { name: 'Queso feta', quantity: 200, unit: 'g',      category: 'Lácteos',  ingredientName: 'Queso feta',        expiresAt: daysFromNow(15) },
  // Huevos
  { name: 'Huevos camperos L', quantity: 12, unit: 'ud', category: 'Huevos', ingredientName: 'Huevos L',          expiresAt: daysFromNow(21) },
  // Embutidos
  { name: 'Jamón serrano', quantity: 200, unit: 'g',   category: 'Embutidos', ingredientName: 'Jamón serrano',    expiresAt: daysFromNow(10) },
  { name: 'Chorizo', quantity: 150, unit: 'g',         category: 'Embutidos', ingredientName: 'Chorizo',          expiresAt: daysFromNow(12) },
  { name: 'Panceta', quantity: 0, unit: 'g',           category: 'Embutidos', ingredientName: 'Panceta',          expiresAt: daysFromNow(5)  },
  // Pan
  { name: 'Pan de molde integral', quantity: 400, unit: 'g', category: 'Pan y bollería', ingredientName: 'Pan de molde', expiresAt: daysFromNow(4) },
  { name: 'Pan rallado', quantity: 300, unit: 'g',    category: 'Pan y bollería', ingredientName: 'Pan rallado',   expiresAt: daysFromNow(90) },
  // Legumbres y cereales
  { name: 'Garbanzos secos', quantity: 500, unit: 'g',  category: 'Legumbres secas', ingredientName: 'Garbanzos secos', expiresAt: daysFromNow(365) },
  { name: 'Lentejas pardinas', quantity: 0, unit: 'g',  category: 'Legumbres secas', ingredientName: 'Lentejas',        expiresAt: daysFromNow(365) },
  { name: 'Arroz blanco', quantity: 1000, unit: 'g',    category: 'Legumbres secas', ingredientName: 'Arroz blanco',    expiresAt: daysFromNow(365) },
  { name: 'Pasta seca', quantity: 500, unit: 'g',       category: 'Legumbres secas', ingredientName: 'Pasta seca',      expiresAt: daysFromNow(365) },
  { name: 'Harina de trigo', quantity: 1000, unit: 'g', category: 'Legumbres secas', ingredientName: 'Harina de trigo', expiresAt: daysFromNow(180) },
  // Conservas
  { name: 'Tomate triturado', quantity: 1600, unit: 'g',  category: 'Conservas', ingredientName: 'Tomate triturado',  expiresAt: daysFromNow(730) },
  { name: 'Aceitunas negras', quantity: 200, unit: 'g',    category: 'Conservas', ingredientName: 'Aceitunas negras',  expiresAt: daysFromNow(180) },
  { name: 'Aceitunas verdes', quantity: 150, unit: 'g',    category: 'Conservas', ingredientName: 'Aceitunas verdes',  expiresAt: daysFromNow(180) },
  { name: 'Aceite de oliva virgen', quantity: 1000, unit: 'ml', category: 'Conservas', ingredientName: 'Aceite de oliva', expiresAt: daysFromNow(540) },
  { name: 'Garbanzos en conserva', quantity: 400, unit: 'g', category: 'Conservas', ingredientName: 'Garbanzos cocidos', expiresAt: daysFromNow(365) },
  { name: 'Bonito en aceite', quantity: 0, unit: 'g',       category: 'Conservas', ingredientName: 'Bonito en aceite',  expiresAt: daysFromNow(365) },
  { name: 'Leche de coco', quantity: 400, unit: 'ml',       category: 'Conservas', ingredientName: 'Leche de coco',     expiresAt: daysFromNow(365) },
  // Despensa suelta
  { name: 'Azúcar blanquilla', quantity: 500, unit: 'g', category: 'Conservas', ingredientName: 'Azúcar',             expiresAt: daysFromNow(730) },
  { name: 'Queso parmesano', quantity: 100, unit: 'g',   category: 'Lácteos',   ingredientName: 'Queso parmesano',    expiresAt: daysFromNow(30)  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Categories
  for (const cat of CATEGORIES) {
    await prisma.ingredientCategory.upsert({
      where: { name: cat.name },
      update: { defaultDays: cat.defaultDays },
      create: cat,
    });
  }
  console.log(`✔ ${CATEGORIES.length} categories`);

  // 2. Demo user
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@mealplanner.com' },
    update: {},
    create: { email: 'demo@mealplanner.com', passwordHash, name: 'Demo User', authProvider: 'LOCAL' },
  });
  console.log(`✔ User: ${user.email}`);

  // 3. Ingredients (100)
  const ingMap = new Map<string, string>();
  for (const ing of INGREDIENTS) {
    const created = await prisma.ingredient.upsert({
      where: { name: ing.name },
      update: { unit: ing.unit, caloriesPer100g: ing.cal },
      create: { name: ing.name, unit: ing.unit, caloriesPer100g: ing.cal },
    });
    ingMap.set(ing.name, created.id);
  }
  console.log(`✔ ${INGREDIENTS.length} ingredients`);

  // 4. Category map
  const cats = await prisma.ingredientCategory.findMany();
  const catMap = new Map(cats.map(c => [c.name, c.id]));

  // 5. Pantry items — reset for demo user
  await prisma.pantryItem.deleteMany({ where: { userId: user.id } });
  for (const item of PANTRY_ITEMS) {
    await prisma.pantryItem.create({
      data: {
        userId: user.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        expiresAt: item.expiresAt ?? null,
        categoryId: catMap.get(item.category) ?? null,
        ingredientId: item.ingredientName ? (ingMap.get(item.ingredientName) ?? null) : null,
      },
    });
  }
  const depleted = PANTRY_ITEMS.filter(i => i.quantity === 0).length;
  console.log(`✔ ${PANTRY_ITEMS.length} pantry items (${depleted} depleted)`);

  // 6. Recipes — reset for demo user (meals first due to FK constraint)
  await prisma.meal.deleteMany({ where: { userId: user.id } });
  await prisma.weeklyPlan.deleteMany({ where: { userId: user.id } });
  await prisma.recipe.deleteMany({ where: { userId: user.id } });
  for (const rec of RECIPES) {
    const recipeIngredients = rec.ingredients
      .filter(i => ingMap.has(i.name))
      .map(i => ({ ingredientId: ingMap.get(i.name)!, quantity: i.quantity }));

    await prisma.recipe.create({
      data: {
        id: rec.id,
        userId: user.id,
        name: rec.name,
        description: rec.description,
        imageUrl: rec.image,
        prepTime: rec.prepTime,
        servings: rec.servings,
        steps: rec.steps,
        recipeIngredients: { create: recipeIngredients },
      },
    });
  }
  console.log(`✔ ${RECIPES.length} recipes`);

  console.log('\n✅ Seed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
