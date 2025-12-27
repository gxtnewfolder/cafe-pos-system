// Product Validation Service
// Centralized validation for product API

// Valid categories (lowercase for comparison)
const VALID_CATEGORIES = ['coffee', 'non-coffee', 'bakery'];

// Map lowercase to display-friendly names
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'coffee': 'COFFEE',
  'non-coffee': 'NON_COFFEE',
  'bakery': 'BAKERY',
};

/**
 * Normalize category to display-friendly name
 * Input can be any case, output will be proper format for storage
 */
function normalizeCategory(category: string): string | null {
  const lower = category.toLowerCase().trim();
  // Handle underscore variant (NON_COFFEE -> non-coffee)
  const normalized = lower.replace('_', '-');
  if (VALID_CATEGORIES.includes(normalized)) {
    return CATEGORY_DISPLAY_NAMES[normalized];
  }
  return null;
}

export type ValidationResult<T = any> = {
  success: boolean;
  error?: string;
  data?: T;
};

export type ProductCreateData = {
  name: string;
  code: string;
  price: number;
  category: string;
  stock: number;
  image_url?: string;
  is_active?: boolean;
};

export type ProductUpdateData = Partial<ProductCreateData>;

/**
 * Validate product data for creation (POST)
 */
export function validateProductCreate(body: any): ValidationResult<ProductCreateData> {
  // Required fields
  const requiredFields = ['name', 'code', 'price', 'category'];
  const missingFields = requiredFields.filter(
    (field) => body[field] === undefined || body[field] === null || body[field] === ''
  );

  if (missingFields.length > 0) {
    return { success: false, error: `Missing required fields: ${missingFields.join(', ')}` };
  }

  // Name
  if (typeof body.name !== 'string' || body.name.trim() === '') {
    return { success: false, error: 'Name must be a non-empty string' };
  }

  // Code
  if (typeof body.code !== 'string' || body.code.trim() === '') {
    return { success: false, error: 'Code must be a non-empty string' };
  }

  // Price
  const price = Number(body.price);
  if (isNaN(price)) {
    return { success: false, error: 'Price must be a valid number' };
  }
  if (price < 0) {
    return { success: false, error: 'Price cannot be negative' };
  }

  // Category
  const normalizedCategory = normalizeCategory(String(body.category));
  if (!normalizedCategory) {
    return { success: false, error: `Invalid category. Must be one of: Coffee, Non-Coffee, Bakery` };
  }

  // Stock (optional, defaults to 0)
  let stock = 0;
  if (body.stock !== undefined && body.stock !== null) {
    stock = Number(body.stock);
    if (!Number.isInteger(stock)) {
      return { success: false, error: 'Stock must be a valid integer' };
    }
    if (stock < 0) {
      return { success: false, error: 'Stock cannot be negative' };
    }
  }

  return {
    success: true,
    data: {
      name: body.name.trim(),
      code: body.code.trim(),
      price,
      category: normalizedCategory,
      stock,
      image_url: body.image_url || undefined,
      is_active: typeof body.is_active === 'boolean' ? body.is_active : true,
    },
  };
}

/**
 * Validate product data for update (PUT - full update)
 */
export function validateProductUpdate(body: any): ValidationResult<ProductCreateData> {
  // For PUT, we require all fields
  const requiredFields = ['name', 'code', 'price', 'category', 'stock'];
  const missingFields = requiredFields.filter(
    (field) => body[field] === undefined || body[field] === null || body[field] === ''
  );

  if (missingFields.length > 0) {
    return { success: false, error: `Missing required fields: ${missingFields.join(', ')}` };
  }

  // Reuse create validation for common checks
  return validateProductCreate(body);
}

/**
 * Validate product data for partial update (PATCH)
 */
export function validateProductPatch(body: any): ValidationResult<ProductUpdateData> {
  const data: ProductUpdateData = {};

  // Name (if provided)
  if (body.name !== undefined && body.name !== null) {
    if (typeof body.name !== 'string' || body.name.trim() === '') {
      return { success: false, error: 'Name must be a non-empty string' };
    }
    data.name = body.name.trim();
  }

  // Code (if provided)
  if (body.code !== undefined && body.code !== null) {
    if (typeof body.code !== 'string' || body.code.trim() === '') {
      return { success: false, error: 'Code must be a non-empty string' };
    }
    data.code = body.code.trim();
  }

  // Price (if provided)
  if (body.price !== undefined && body.price !== null) {
    const price = Number(body.price);
    if (isNaN(price)) {
      return { success: false, error: 'Price must be a valid number' };
    }
    if (price < 0) {
      return { success: false, error: 'Price cannot be negative' };
    }
    data.price = price;
  }

  // Category (if provided)
  if (body.category !== undefined && body.category !== null) {
    const normalizedCategory = normalizeCategory(String(body.category));
    if (!normalizedCategory) {
      return { success: false, error: `Invalid category. Must be one of: Coffee, Non-Coffee, Bakery` };
    }
    data.category = normalizedCategory;
  }

  // Stock (if provided)
  if (body.stock !== undefined && body.stock !== null) {
    const stock = Number(body.stock);
    if (!Number.isInteger(stock)) {
      return { success: false, error: 'Stock must be a valid integer' };
    }
    if (stock < 0) {
      return { success: false, error: 'Stock cannot be negative' };
    }
    data.stock = stock;
  }

  // Image URL (if provided)
  if (body.image_url !== undefined) {
    data.image_url = body.image_url;
  }

  // is_active (if provided)
  if (body.is_active !== undefined) {
    data.is_active = body.is_active;
  }

  return { success: true, data };
}
