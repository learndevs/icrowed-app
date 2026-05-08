type Method =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete";

type Parameter = {
  name: string;
  in: "path" | "query" | "header";
  required?: boolean;
  schema: Record<string, unknown>;
  description?: string;
};

type Operation = {
  tags: string[];
  summary: string;
  description?: string;
  operationId: string;
  security?: Array<Record<string, string[]>>;
  parameters?: Parameter[];
  requestBody?: Record<string, unknown>;
  responses: Record<string, unknown>;
};

type PathItem = Partial<Record<Method, Operation>>;

const json = { "application/json": { schema: { type: "object", additionalProperties: true } } };
const csv = { "text/csv": { schema: { type: "string" } } };
const html = { "text/html": { schema: { type: "string" } } };
const redirect = { description: "Redirect response" };
const ok = { description: "Success", content: json };
const created = { description: "Created", content: json };
const noContent = { description: "Deleted or no content" };
const unauthorized = { description: "Unauthorized" };
const forbidden = { description: "Forbidden" };
const notFound = { description: "Not found" };
const serverError = { description: "Server error" };
const adminSecurity = [{ cookieAuth: [] }];
const userSecurity = [{ cookieAuth: [] }];

function pathParam(name = "id"): Parameter {
  return {
    name,
    in: "path",
    required: true,
    schema: { type: "string" },
  };
}

function queryParam(name: string, schema: Record<string, unknown>, description?: string): Parameter {
  return {
    name,
    in: "query",
    schema,
    description,
  };
}

function body(schema: Record<string, unknown>) {
  return {
    required: true,
    content: {
      "application/json": { schema },
    },
  };
}

function formBody() {
  return {
    required: true,
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          additionalProperties: true,
        },
      },
    },
  };
}

function formUrlBody() {
  return {
    required: true,
    content: {
      "application/x-www-form-urlencoded": {
        schema: {
          type: "object",
          additionalProperties: true,
        },
      },
    },
  };
}

function responses(extra: Record<string, unknown> = {}) {
  return {
    "200": ok,
    "401": unauthorized,
    "404": notFound,
    "500": serverError,
    ...extra,
  };
}

function crudTag(tag: string, summary: string, operationId: string): Operation {
  return {
    tags: [tag],
    summary,
    operationId,
    responses: responses(),
  };
}

const stringSchema = { type: "string" };
const numberSchema = { type: "number" };
const booleanSchema = { type: "boolean" };
const uuidSchema = { type: "string", format: "uuid" };
const dateTimeSchema = { type: "string", format: "date-time" };

const paths: Record<string, PathItem> = {
  "/api/openapi": {
    get: {
      tags: ["Docs"],
      summary: "Get the OpenAPI document",
      operationId: "getOpenApiDocument",
      responses: responses(),
    },
  },
  "/api/account/orders": {
    get: {
      tags: ["Account"],
      summary: "List orders for the current account",
      operationId: "listAccountOrders",
      security: userSecurity,
      responses: responses(),
    },
  },
  "/api/addresses": {
    get: {
      tags: ["Addresses"],
      summary: "List current user's addresses",
      operationId: "listAddresses",
      security: userSecurity,
      responses: responses(),
    },
    post: {
      tags: ["Addresses"],
      summary: "Create an address",
      operationId: "createAddress",
      security: userSecurity,
      requestBody: body({
        type: "object",
        properties: {
          label: stringSchema,
          recipientName: stringSchema,
          phone: stringSchema,
          addressLine1: stringSchema,
          addressLine2: stringSchema,
          city: stringSchema,
          district: stringSchema,
          postalCode: stringSchema,
          isDefault: booleanSchema,
        },
      }),
      responses: responses({ "201": created }),
    },
  },
  "/api/addresses/{id}": {
    patch: {
      tags: ["Addresses"],
      summary: "Update an address",
      operationId: "updateAddress",
      security: userSecurity,
      parameters: [pathParam()],
      requestBody: body({ type: "object", additionalProperties: true }),
      responses: responses(),
    },
    delete: {
      tags: ["Addresses"],
      summary: "Delete an address",
      operationId: "deleteAddress",
      security: userSecurity,
      parameters: [pathParam()],
      responses: responses({ "204": noContent }),
    },
  },
  "/api/addresses/{id}/set-default": {
    post: {
      tags: ["Addresses"],
      summary: "Set an address as default",
      operationId: "setDefaultAddress",
      security: userSecurity,
      parameters: [pathParam()],
      responses: responses(),
    },
  },
  "/api/admin/admins/invite": {
    post: {
      tags: ["Admin Users"],
      summary: "Invite an admin or operator",
      operationId: "inviteAdmin",
      security: adminSecurity,
      requestBody: body({
        type: "object",
        required: ["email", "role"],
        properties: {
          email: { type: "string", format: "email" },
          fullName: stringSchema,
          role: { type: "string", enum: ["admin", "operator"] },
        },
      }),
      responses: responses({ "201": created, "403": forbidden }),
    },
  },
  "/api/admin/analytics/export": {
    get: {
      tags: ["Admin Analytics"],
      summary: "Export analytics CSV",
      operationId: "exportAnalytics",
      security: adminSecurity,
      parameters: [
        queryParam("range", stringSchema, "Preset date range"),
        queryParam("from", { type: "string", format: "date" }),
        queryParam("to", { type: "string", format: "date" }),
      ],
      responses: { "200": { description: "CSV export", content: csv }, "401": unauthorized },
    },
  },
  "/api/admin/customers/{id}/deactivate": {
    patch: {
      tags: ["Admin Customers"],
      summary: "Deactivate or reactivate a customer",
      operationId: "setCustomerActive",
      security: adminSecurity,
      parameters: [pathParam()],
      requestBody: body({ type: "object", properties: { isActive: booleanSchema } }),
      responses: responses({ "403": forbidden }),
    },
  },
  "/api/admin/customers/{id}/role": {
    patch: {
      tags: ["Admin Customers"],
      summary: "Change a user's role",
      operationId: "updateCustomerRole",
      security: adminSecurity,
      parameters: [pathParam()],
      requestBody: body({
        type: "object",
        required: ["role"],
        properties: { role: { type: "string", enum: ["customer", "operator", "admin"] } },
      }),
      responses: responses({ "403": forbidden }),
    },
  },
  "/api/admin/email-templates": {
    get: {
      tags: ["Admin Email Templates"],
      summary: "List email templates",
      operationId: "listEmailTemplates",
      security: adminSecurity,
      responses: responses(),
    },
  },
  "/api/admin/email-templates/{key}": {
    get: {
      tags: ["Admin Email Templates"],
      summary: "Get an email template",
      operationId: "getEmailTemplate",
      security: adminSecurity,
      parameters: [pathParam("key")],
      responses: responses(),
    },
    put: {
      tags: ["Admin Email Templates"],
      summary: "Update an email template",
      operationId: "updateEmailTemplate",
      security: adminSecurity,
      parameters: [pathParam("key")],
      requestBody: body({
        type: "object",
        properties: {
          subject: stringSchema,
          bodyHtml: stringSchema,
          bodyText: stringSchema,
          isActive: booleanSchema,
        },
      }),
      responses: responses(),
    },
  },
  "/api/admin/email-templates/{key}/test": {
    post: {
      tags: ["Admin Email Templates"],
      summary: "Send a test email for a template",
      operationId: "sendEmailTemplateTest",
      security: adminSecurity,
      parameters: [pathParam("key")],
      requestBody: body({
        type: "object",
        required: ["to"],
        properties: {
          to: { type: "string", format: "email" },
          vars: { type: "object", additionalProperties: true },
        },
      }),
      responses: responses(),
    },
  },
  "/api/admin/orders/{id}/invoice": {
    get: {
      tags: ["Admin Orders"],
      summary: "Download an order invoice",
      operationId: "downloadOrderInvoice",
      security: adminSecurity,
      parameters: [pathParam()],
      responses: {
        "200": { description: "Invoice HTML", content: html },
        "401": unauthorized,
        "404": notFound,
      },
    },
  },
  "/api/admin/orders/export": {
    get: {
      tags: ["Admin Orders"],
      summary: "Export orders CSV",
      operationId: "exportOrders",
      security: adminSecurity,
      parameters: [
        queryParam("status", stringSchema),
        queryParam("from", { type: "string", format: "date" }),
        queryParam("to", { type: "string", format: "date" }),
      ],
      responses: { "200": { description: "CSV export", content: csv }, "401": unauthorized },
    },
  },
  "/api/admin/settings": {
    get: {
      tags: ["Admin Settings"],
      summary: "Get store settings",
      operationId: "getAdminSettings",
      security: adminSecurity,
      responses: responses(),
    },
    put: {
      tags: ["Admin Settings"],
      summary: "Update store settings",
      operationId: "updateAdminSettings",
      security: adminSecurity,
      requestBody: body({ type: "object", additionalProperties: true }),
      responses: responses(),
    },
  },
  "/api/admin/settings/notifications": {
    get: {
      tags: ["Admin Settings"],
      summary: "Get notification preferences",
      operationId: "getNotificationSettings",
      security: adminSecurity,
      responses: responses(),
    },
    put: {
      tags: ["Admin Settings"],
      summary: "Update notification preferences",
      operationId: "updateNotificationSettings",
      security: adminSecurity,
      requestBody: body({ type: "object", additionalProperties: true }),
      responses: responses(),
    },
  },
  "/api/auth/callback": {
    get: {
      tags: ["Auth"],
      summary: "Supabase OAuth callback",
      operationId: "authCallback",
      parameters: [
        queryParam("code", stringSchema),
        queryParam("next", stringSchema),
      ],
      responses: { "302": redirect },
    },
  },
  "/api/brands": {
    get: {
      tags: ["Brands"],
      summary: "List brands",
      operationId: "listBrands",
      parameters: [queryParam("all", booleanSchema, "Include inactive brands")],
      responses: responses(),
    },
    post: {
      tags: ["Brands"],
      summary: "Create a brand",
      operationId: "createBrand",
      security: adminSecurity,
      requestBody: body({
        type: "object",
        required: ["name"],
        properties: { name: stringSchema, logoUrl: stringSchema, isActive: booleanSchema },
      }),
      responses: responses({ "201": created }),
    },
  },
  "/api/brands/{id}": {
    get: { ...crudTag("Brands", "Get a brand", "getBrand"), parameters: [pathParam()] },
    put: {
      ...crudTag("Brands", "Update a brand", "updateBrand"),
      security: adminSecurity,
      parameters: [pathParam()],
      requestBody: body({ type: "object", additionalProperties: true }),
    },
    delete: {
      ...crudTag("Brands", "Delete a brand", "deleteBrand"),
      security: adminSecurity,
      parameters: [pathParam()],
    },
  },
  "/api/categories": {
    get: {
      tags: ["Categories"],
      summary: "List categories",
      operationId: "listCategories",
      parameters: [queryParam("all", booleanSchema, "Include inactive categories")],
      responses: responses(),
    },
    post: {
      tags: ["Categories"],
      summary: "Create a category",
      operationId: "createCategory",
      security: adminSecurity,
      requestBody: body({
        type: "object",
        required: ["name"],
        properties: {
          name: stringSchema,
          description: stringSchema,
          sortOrder: numberSchema,
          isActive: booleanSchema,
        },
      }),
      responses: responses({ "201": created }),
    },
  },
  "/api/categories/{id}": {
    get: { ...crudTag("Categories", "Get a category", "getCategory"), parameters: [pathParam()] },
    put: {
      ...crudTag("Categories", "Update a category", "updateCategory"),
      security: adminSecurity,
      parameters: [pathParam()],
      requestBody: body({ type: "object", additionalProperties: true }),
    },
    delete: {
      ...crudTag("Categories", "Delete a category", "deleteCategory"),
      security: adminSecurity,
      parameters: [pathParam()],
    },
  },
  "/api/coupons": {
    get: crudTag("Coupons", "List coupons", "listCoupons"),
    post: {
      tags: ["Coupons"],
      summary: "Create a coupon",
      operationId: "createCoupon",
      security: adminSecurity,
      requestBody: body({
        type: "object",
        properties: {
          code: stringSchema,
          type: { type: "string", enum: ["percent", "fixed"] },
          value: numberSchema,
          minOrderAmount: numberSchema,
          maxUses: numberSchema,
          isActive: booleanSchema,
          expiresAt: dateTimeSchema,
        },
      }),
      responses: responses({ "201": created }),
    },
  },
  "/api/coupons/{id}": {
    put: {
      ...crudTag("Coupons", "Update a coupon", "updateCoupon"),
      security: adminSecurity,
      parameters: [pathParam()],
      requestBody: body({ type: "object", additionalProperties: true }),
    },
    delete: {
      ...crudTag("Coupons", "Delete a coupon", "deleteCoupon"),
      security: adminSecurity,
      parameters: [pathParam()],
    },
  },
  "/api/coupons/validate": {
    post: {
      tags: ["Coupons"],
      summary: "Validate a coupon for checkout",
      operationId: "validateCoupon",
      requestBody: body({
        type: "object",
        required: ["code", "subtotal"],
        properties: { code: stringSchema, subtotal: numberSchema },
      }),
      responses: responses(),
    },
  },
  "/api/new-arrivals": {
    get: crudTag("Products", "List new arrivals", "listNewArrivals"),
  },
  "/api/offers": {
    get: {
      tags: ["Offers"],
      summary: "List offers",
      operationId: "listOffers",
      parameters: [queryParam("all", booleanSchema, "Include inactive offers")],
      responses: responses(),
    },
    post: {
      tags: ["Offers"],
      summary: "Create an offer",
      operationId: "createOffer",
      security: adminSecurity,
      requestBody: body({ type: "object", additionalProperties: true }),
      responses: responses({ "201": created }),
    },
  },
  "/api/offers/{id}": {
    put: {
      ...crudTag("Offers", "Update an offer", "updateOffer"),
      security: adminSecurity,
      parameters: [pathParam()],
      requestBody: body({ type: "object", additionalProperties: true }),
    },
    delete: {
      ...crudTag("Offers", "Delete an offer", "deleteOffer"),
      security: adminSecurity,
      parameters: [pathParam()],
    },
  },
  "/api/orders": {
    get: {
      tags: ["Orders"],
      summary: "Get an order by number or list orders for admin",
      operationId: "getOrListOrders",
      parameters: [
        queryParam("orderNumber", stringSchema),
        queryParam("limit", numberSchema),
      ],
      responses: responses(),
    },
    post: {
      tags: ["Orders"],
      summary: "Create an order",
      operationId: "createOrder",
      requestBody: body({
        type: "object",
        required: ["items", "customerName", "customerPhone", "shippingAddressLine1"],
        properties: {
          items: { type: "array", items: { type: "object", additionalProperties: true } },
          customerName: stringSchema,
          customerEmail: { type: "string", format: "email" },
          customerPhone: stringSchema,
          shippingAddressLine1: stringSchema,
          shippingCity: stringSchema,
          shippingDistrict: stringSchema,
          paymentMethod: stringSchema,
          couponCode: stringSchema,
        },
      }),
      responses: responses({ "201": created }),
    },
  },
  "/api/orders/{id}": {
    get: {
      tags: ["Orders"],
      summary: "Get order details",
      operationId: "getOrder",
      parameters: [pathParam()],
      responses: responses(),
    },
    patch: {
      tags: ["Orders"],
      summary: "Update an order",
      operationId: "updateOrder",
      security: adminSecurity,
      parameters: [pathParam()],
      requestBody: body({
        type: "object",
        properties: {
          status: stringSchema,
          trackingNumber: stringSchema,
          courierName: stringSchema,
          adminNote: stringSchema,
        },
      }),
      responses: responses(),
    },
  },
  "/api/orders/{id}/refund": {
    post: {
      tags: ["Orders"],
      summary: "Issue or mark a refund",
      operationId: "refundOrder",
      security: adminSecurity,
      parameters: [pathParam()],
      requestBody: body({ type: "object", properties: { reason: stringSchema, adminNote: stringSchema } }),
      responses: responses(),
    },
  },
  "/api/payhere/initiate": {
    post: {
      tags: ["Payments"],
      summary: "Create PayHere checkout payload",
      operationId: "initiatePayHere",
      requestBody: body({ type: "object", additionalProperties: true }),
      responses: responses(),
    },
  },
  "/api/payhere/notify": {
    post: {
      tags: ["Payments"],
      summary: "PayHere payment notification webhook",
      operationId: "payHereNotify",
      requestBody: formUrlBody(),
      responses: responses(),
    },
  },
  "/api/products": {
    get: {
      tags: ["Products"],
      summary: "List products",
      operationId: "listProducts",
      parameters: [
        queryParam("search", stringSchema),
        queryParam("categoryId", uuidSchema),
        queryParam("isActive", booleanSchema),
        queryParam("page", numberSchema),
        queryParam("limit", numberSchema),
      ],
      responses: responses(),
    },
    post: {
      tags: ["Products"],
      summary: "Create a product",
      operationId: "createProduct",
      security: adminSecurity,
      requestBody: body({ type: "object", additionalProperties: true }),
      responses: responses({ "201": created }),
    },
  },
  "/api/products/{id}": {
    get: {
      tags: ["Products"],
      summary: "Get a product",
      operationId: "getProduct",
      parameters: [pathParam()],
      responses: responses(),
    },
    put: {
      ...crudTag("Products", "Update a product", "updateProduct"),
      security: adminSecurity,
      parameters: [pathParam()],
      requestBody: body({ type: "object", additionalProperties: true }),
    },
    delete: {
      ...crudTag("Products", "Delete a product", "deleteProduct"),
      security: adminSecurity,
      parameters: [pathParam()],
    },
  },
  "/api/products/{id}/images": {
    get: {
      tags: ["Product Images"],
      summary: "List product images",
      operationId: "listProductImages",
      parameters: [pathParam()],
      responses: responses(),
    },
    post: {
      tags: ["Product Images"],
      summary: "Upload a product image",
      operationId: "uploadProductImage",
      security: adminSecurity,
      parameters: [pathParam()],
      requestBody: formBody(),
      responses: responses({ "201": created }),
    },
  },
  "/api/products/{id}/images/{imageId}": {
    patch: {
      tags: ["Product Images"],
      summary: "Update a product image",
      operationId: "updateProductImage",
      security: adminSecurity,
      parameters: [pathParam(), pathParam("imageId")],
      requestBody: body({ type: "object", additionalProperties: true }),
      responses: responses(),
    },
    delete: {
      tags: ["Product Images"],
      summary: "Delete a product image",
      operationId: "deleteProductImage",
      security: adminSecurity,
      parameters: [pathParam(), pathParam("imageId")],
      responses: responses(),
    },
  },
  "/api/products/{id}/reviews": {
    get: {
      tags: ["Reviews"],
      summary: "List reviews for a product",
      operationId: "listProductReviews",
      parameters: [pathParam()],
      responses: responses(),
    },
  },
  "/api/products/batch": {
    get: {
      tags: ["Products"],
      summary: "Get products by IDs",
      operationId: "getProductsBatch",
      parameters: [
        queryParam("ids", stringSchema, "Comma-separated product IDs"),
        queryParam("variantIds", stringSchema, "Comma-separated variant IDs"),
      ],
      responses: responses(),
    },
  },
  "/api/profile": {
    get: {
      tags: ["Profile"],
      summary: "Get current user's profile",
      operationId: "getProfile",
      security: userSecurity,
      responses: responses(),
    },
    patch: {
      tags: ["Profile"],
      summary: "Update current user's profile",
      operationId: "updateProfile",
      security: userSecurity,
      requestBody: body({ type: "object", properties: { fullName: stringSchema, phone: stringSchema } }),
      responses: responses(),
    },
  },
  "/api/reviews": {
    get: {
      tags: ["Reviews"],
      summary: "List reviews",
      operationId: "listReviews",
      parameters: [queryParam("filter", { type: "string", enum: ["pending", "all"] })],
      responses: responses(),
    },
    post: {
      tags: ["Reviews"],
      summary: "Create a review",
      operationId: "createReview",
      security: userSecurity,
      requestBody: body({ type: "object", additionalProperties: true }),
      responses: responses({ "201": created }),
    },
  },
  "/api/reviews/{id}": {
    patch: {
      tags: ["Reviews"],
      summary: "Approve a review",
      operationId: "approveReview",
      security: adminSecurity,
      parameters: [pathParam()],
      responses: responses(),
    },
    delete: {
      tags: ["Reviews"],
      summary: "Delete a review",
      operationId: "deleteReview",
      security: adminSecurity,
      parameters: [pathParam()],
      responses: responses(),
    },
  },
  "/api/shipping-rates": {
    get: crudTag("Shipping", "Get shipping rates", "getShippingRates"),
    put: {
      tags: ["Shipping"],
      summary: "Update shipping rates",
      operationId: "updateShippingRates",
      security: adminSecurity,
      requestBody: body({
        type: "object",
        properties: {
          standardLkr: numberSchema,
          expressLkr: numberSchema,
          freeShippingMinSubtotal: numberSchema,
        },
      }),
      responses: responses(),
    },
  },
  "/api/stripe/checkout": {
    post: {
      tags: ["Payments"],
      summary: "Create a Stripe checkout session",
      operationId: "createStripeCheckout",
      requestBody: body({ type: "object", additionalProperties: true }),
      responses: responses(),
    },
  },
  "/api/stripe/webhook": {
    post: {
      tags: ["Payments"],
      summary: "Stripe webhook",
      operationId: "stripeWebhook",
      parameters: [
        {
          name: "stripe-signature",
          in: "header",
          required: true,
          schema: stringSchema,
        },
      ],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { type: "object", additionalProperties: true } } },
      },
      responses: responses(),
    },
  },
  "/api/wishlist": {
    get: {
      tags: ["Wishlist"],
      summary: "Get current user's wishlist",
      operationId: "getWishlist",
      security: userSecurity,
      responses: responses(),
    },
    post: {
      tags: ["Wishlist"],
      summary: "Add a product to wishlist",
      operationId: "addWishlistItem",
      security: userSecurity,
      requestBody: body({ type: "object", required: ["productId"], properties: { productId: uuidSchema } }),
      responses: responses(),
    },
  },
  "/api/wishlist/{productId}": {
    delete: {
      tags: ["Wishlist"],
      summary: "Remove a product from wishlist",
      operationId: "removeWishlistItem",
      security: userSecurity,
      parameters: [pathParam("productId")],
      responses: responses(),
    },
  },
};

export function getOpenApiSpec(origin = "http://localhost:3000") {
  return {
    openapi: "3.1.0",
    info: {
      title: "iCrowed Backend API",
      version: "1.0.0",
      description:
        "OpenAPI documentation for the iCrowed Next.js backend routes. Admin operations require an authenticated admin Supabase session.",
    },
    servers: [{ url: origin }],
    tags: [
      "Account",
      "Addresses",
      "Admin Analytics",
      "Admin Customers",
      "Admin Email Templates",
      "Admin Orders",
      "Admin Settings",
      "Admin Users",
      "Auth",
      "Brands",
      "Categories",
      "Coupons",
      "Docs",
      "Offers",
      "Orders",
      "Payments",
      "Product Images",
      "Products",
      "Profile",
      "Reviews",
      "Shipping",
      "Wishlist",
    ].map((name) => ({ name })),
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "sb-access-token",
          description:
            "Supabase SSR auth cookies are used by the application. Cookie names may vary by Supabase project.",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: { error: stringSchema },
        },
      },
    },
    paths,
  };
}
