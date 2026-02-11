import * as CartModel from "./cart.model.js";

// Get user's cart
export const getCartController = async (req, res) => {
    try {
        const userId = req.user.userID;
        const cart = await CartModel.getCartByUserId(userId);
        res.json(cart);
    } catch (err) {
        console.error("Error fetching cart:", err);
        res.status(500).json({ message: "Failed to fetch cart" });
    }
};

// Add item to cart
export const addToCartController = async (req, res) => {
    try {
        const userId = req.user.userID;
        const { variantId, quantity } = req.body;

        if (!variantId || !quantity) {
            return res.status(400).json({ message: "Variant ID and quantity are required" });
        }

        await CartModel.addToCart(userId, variantId, parseInt(quantity));
        res.status(200).json({ message: "Item added to cart successfully" });
    } catch (err) {
        console.error("Error adding to cart:", err);
        res.status(500).json({ message: "Failed to add item to cart" });
    }
};

// Update item quantity
export const updateCartItemController = async (req, res) => {
    try {
        const userId = req.user.userID;
        const { cartItemId } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined) {
             return res.status(400).json({ message: "Quantity is required" });
        }

        const updated = await CartModel.updateCartItemQuantity(userId, cartItemId, parseInt(quantity));
        
        if (!updated) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        res.json({ message: "Cart item updated successfully" });
    } catch (err) {
        console.error("Error updating cart item:", err);
        res.status(500).json({ message: "Failed to update cart item" });
    }
};

// Remove item from cart
export const removeFromCartController = async (req, res) => {
    try {
        const userId = req.user.userID;
        const { cartItemId } = req.params;

        const removed = await CartModel.removeFromCart(userId, cartItemId);
        
        if (!removed) {
             return res.status(404).json({ message: "Item not found in cart" });
        }

        res.json({ message: "Item removed from cart" });
    } catch (err) {
        console.error("Error removing from cart:", err);
        res.status(500).json({ message: "Failed to remove item from cart" });
    }
};

// Clear cart
export const clearCartController = async (req, res) => {
    try {
        const userId = req.user.userID;
        await CartModel.clearCart(userId);
        res.json({ message: "Cart cleared successfully" });
    } catch (err) {
        console.error("Error clearing cart:", err);
        res.status(500).json({ message: "Failed to clear cart" });
    }
};
