import express from 'express';
import cors from 'cors';
import { products, Product } from './data';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Endpoint to get all products
app.get('/products', (req, res) => {
    res.json(products);
});

// Endpoint to get a single product by its ID (for internal/legacy use)
app.get('/products/:id', (req, res) => {
    const { id } = req.params;
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    // Handle bundles by enriching the product with full bundle details
    if (product.bundleIncludes) {
        const includedProducts = product.bundleIncludes
            .map(bundleId => products.find(p => p.id === bundleId))
            .filter((p): p is Product => p !== undefined);
        return res.json({
            ...product,
            bundleProducts: includedProducts,
        });
    }

    res.json(product);
});

// Endpoint to get a single product by its slug (for frontend use)
app.get('/products/slug/:slug', (req, res) => {
    const { slug } = req.params;
    const product = products.find(p => p.slug === slug);

    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    // Handle bundles, similar to the ID endpoint
    if (product.bundleIncludes) {
        const includedProducts = product.bundleIncludes
            .map(bundleId => products.find(p => p.id === bundleId))
            .filter((p): p is Product => p !== undefined);
        return res.json({
            ...product,
            bundleProducts: includedProducts,
        });
    }

    res.json(product);
});

app.listen(port, () => {
    console.log(`Product service running on http://localhost:${port}`);
});
