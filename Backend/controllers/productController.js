const pool = require("../config/database");
const slugify = require("slugify");

exports.getProducts = async (req, res) => {
  try {
    const { category, sort, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      query += ` AND (
        p.name ILIKE $${params.length + 1}
      )`;
      params.push(`%${search}%`);
    }

    if (category) {
      query += ` AND c.slug = $${params.length + 1}`;
      params.push(category);
    }

    if (sort) {
      switch (sort) {
        case "price_asc":
          query += ` ORDER BY p.price ASC`;
          break;
        case "price_desc":
          query += ` ORDER BY p.price DESC`;
          break;
        case "newest":
          query += ` ORDER BY p.created_at DESC`;
          break;
        default:
          query += ` ORDER BY p.created_at DESC`;
      }
    }

    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);

    const countQuery = `
      SELECT COUNT(*) FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
      ${
        search
          ? ` AND (p.name ILIKE $1 OR p.description ILIKE $1 OR p.brand ILIKE $1)`
          : ""
      }
      ${category ? ` AND c.slug = $${search ? "2" : "1"}` : ""}
    `;

    const countParams = [];
    if (search) countParams.push(`%${search}%`);
    if (category) countParams.push(category);

    const { rows: countRows } = await pool.query(countQuery, countParams);

    const totalProducts = parseInt(countRows[0].count);
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      products: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    if (error.code === "42P01") {
      return res.error(
        500,
        "Products table does not exist. Please run migrations."
      );
    }
    return res.error(500, "Error fetching products", error);
  }
};

exports.getProduct = async (req, res) => {
  try {
    const { slug } = req.params;

    const { rows } = await pool.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.slug = $1`,
      [slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    if (error.code === "42P01") {
      return res.error(
        500,
        "Products table does not exist. Please run migrations."
      );
    }
    return res.error(500, "Error fetching product", error);
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      type,
      warranty_period,
      start_date,
      description,
      price,
      category_id,
      stock,
      image_url,
    } = req.body;

    const slug = slugify(name, { lower: true });

    const { rows } = await pool.query(
      `INSERT INTO products (
        name, slug, brand, type, warranty_period, 
        start_date, description, price, category_id, stock, image_url
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *`,
      [
        name,
        slug,
        brand,
        type,
        warranty_period,
        start_date,
        description,
        price,
        category_id,
        stock,
        image_url,
      ]
    );

    return res.json(rows[0]);
  } catch (error) {
    console.log(error);
    if (error.code === "42P01") {
      return res.error(
        500,
        "Products table does not exist. Please run migrations."
      );
    }
    if (error.code === "23505") {
      return res.error(400, "A product with this name already exists.");
    }
    if (error.code === "23503") {
      return res.error(400, "Invalid category ID provided.");
    }
    return res.error(500, "Error creating product", error);
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { slug } = req.params;
    const {
      name,
      brand,
      type,
      warranty_period,
      start_date,
      description,
      price,
      category_id,
      stock,
    } = req.body;

    const image_url = req.file ? req.file.path : null;

    const newSlug = name ? slugify(name, { lower: true }) : slug;

    const updateFields = [];
    const values = [];
    let paramCounter = 1;

    if (name) {
      updateFields.push(`name = $${paramCounter}`);
      values.push(name);
      paramCounter++;
      updateFields.push(`slug = $${paramCounter}`);
      values.push(newSlug);
      paramCounter++;
    }
    if (description) {
      updateFields.push(`description = $${paramCounter}`);
      values.push(description);
      paramCounter++;
    }
    if (price) {
      updateFields.push(`price = $${paramCounter}`);
      values.push(price);
      paramCounter++;
    }
    if (category_id) {
      updateFields.push(`category_id = $${paramCounter}`);
      values.push(category_id);
      paramCounter++;
    }
    if (stock !== undefined) {
      updateFields.push(`stock = $${paramCounter}`);
      values.push(stock);
      paramCounter++;
    }
    if (brand) {
      updateFields.push(`brand = $${paramCounter}`);
      values.push(brand);
      paramCounter++;
    }
    if (type) {
      updateFields.push(`type = $${paramCounter}`);
      values.push(type);
      paramCounter++;
    }
    if (warranty_period) {
      updateFields.push(`warranty_period = $${paramCounter}`);
      values.push(warranty_period);
      paramCounter++;
    }
    if (start_date) {
      updateFields.push(`start_date = $${paramCounter}`);
      values.push(start_date);
      paramCounter++;
    }

    if (image_url) {
      updateFields.push(`image_url = $${paramCounter}`);
      values.push(image_url);
      paramCounter++;

      const { rows: oldProduct } = await pool.query(
        "SELECT image_url FROM products WHERE slug = $1",
        [slug]
      );

      if (oldProduct[0]?.image_url) {
        const publicId = oldProduct[0].image_url.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`products/${publicId}`);
      }
    }

    values.push(slug);

    const query = `
      UPDATE products 
      SET ${updateFields.join(", ")}, 
          updated_at = CURRENT_TIMESTAMP
      WHERE slug = $${paramCounter}
      RETURNING *`;

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      if (req.file && req.file.path) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    if (req.file && req.file.path) {
      await cloudinary.uploader.destroy(req.file.filename);
    }

    if (error.code === "42P01") {
      return res.error(
        500,
        "Products table does not exist. Please run migrations."
      );
    }
    if (error.code === "23505") {
      return res.error(400, "A product with this name already exists.");
    }
    if (error.code === "23503") {
      return res.error(400, "Invalid category ID provided.");
    }
    return res.error(500, "Error updating product", error);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { slug } = req.params;

    const { rows: productToDelete } = await pool.query(
      "SELECT image_url FROM products WHERE slug = $1",
      [slug]
    );

    const { rows } = await pool.query(
      "DELETE FROM products WHERE slug = $1 RETURNING *",
      [slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (productToDelete[0]?.image_url) {
      const publicId = productToDelete[0].image_url
        .split("/")
        .pop()
        .split(".")[0];
      await cloudinary.uploader.destroy(`products/${publicId}`);
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    if (error.code === "42P01") {
      return res.error(
        500,
        "Products table does not exist. Please run migrations."
      );
    }
    return res.error(500, "Error deleting product", error);
  }
};
