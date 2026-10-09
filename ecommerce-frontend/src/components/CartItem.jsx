import { useDispatch } from 'react-redux';
import { updateCartQuantity, removeFromCart } from '../redux/slices/cartSlice';
import { formatCurrency } from '../utils/formatCurrency';

const FALLBACK_IMAGE = 'https://placehold.co/200x200/e0e0e0/888888?text=Image+Unavailable';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const { product, name, price, image, quantity, stock } = item;

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (!Number.isNaN(newQuantity) && newQuantity >= 1 && newQuantity <= stock) {
      dispatch(updateCartQuantity({ product, quantity: newQuantity }));
    }
  };

  const handleIncrement = () => {
    if (quantity < stock) {
      dispatch(updateCartQuantity({ product, quantity: quantity + 1 }));
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      dispatch(updateCartQuantity({ product, quantity: quantity - 1 }));
    }
  };

  const handleRemove = () => {
    dispatch(removeFromCart(product));
  };

  const handleImageError = (e) => {
    if (e.target.src !== FALLBACK_IMAGE) {
      e.target.src = FALLBACK_IMAGE;
    }
  };

  return (
    <div className="cart-item">
      <div className="cart-item-image-wrapper">
        <img
          src={image || FALLBACK_IMAGE}
          alt={name}
          className="cart-item-image"
          onError={handleImageError}
        />
      </div>

      <div className="cart-item-details">
        <h4 className="cart-item-name">{name}</h4>
        <p className="cart-item-price">{formatCurrency(price)} each</p>
        {stock < 5 && stock > 0 && (
          <p className="cart-item-stock-warning">Only {stock} left in stock</p>
        )}
        {stock === 0 && (
          <p className="cart-item-stock-warning">Currently out of stock</p>
        )}
      </div>

      <div className="cart-item-quantity">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={quantity <= 1}
          aria-label={`Decrease quantity of ${name}`}
        >
          −
        </button>
        <label htmlFor={`quantity-${product}`} className="sr-only">
          Quantity for {name}
        </label>
        <input
          type="number"
          id={`quantity-${product}`}
          name={`quantity-${product}`}
          min="1"
          max={stock}
          value={quantity}
          onChange={handleQuantityChange}
        />
        <button
          type="button"
          onClick={handleIncrement}
          disabled={quantity >= stock}
          aria-label={`Increase quantity of ${name}`}
        >
          +
        </button>
      </div>

      <div className="cart-item-subtotal">
        {formatCurrency(price * quantity)}
      </div>

      <button type="button" className="cart-item-remove" onClick={handleRemove}>
        Remove
      </button>
    </div>
  );
};

export default CartItem;