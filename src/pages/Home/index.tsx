import React, { useState, useEffect, useCallback } from "react";
import { MdAddShoppingCart } from "react-icons/md";

import { ProductList } from "./styles";
import { api } from "../../services/api";
import { formatPrice } from "../../util/format";
import { useCart } from "../../hooks/useCart";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();
  /*
  const cartItemsAmount = useMemo(
    () =>
      cart.reduce((sumAmount, product) => {
        sumAmount[product.id] = product.id;

        return sumAmount;
      }, {} as CartItemsAmount),
    [cart]
  );*/

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    sumAmount[product.id] = product.amount;
    return sumAmount;
  }, {} as CartItemsAmount);

  useEffect(() => {
    async function loadProducts() {
      const res = await api.get("products");
      setProducts(
        res.data.map((product: Product) => {
          return {
            ...product,
            price: formatPrice(product.price),
          };
        })
      );
    }

    loadProducts();
  }, []);

  const handleAddProduct = useCallback(
    async (id: number) => {
      await addProduct(id);
    },
    [addProduct]
  );

  return (
    <ProductList>
      {products.map((product) => {
        return (
          <li key={product.id}>
            <img src={product.image} alt={product.title} />
            <strong>{product.title}</strong>
            <span>{product.price}</span>

            <button
              type="button"
              data-testid="add-product-button"
              onClick={() => handleAddProduct(product.id)}
            >
              <div data-testid="cart-product-quantity">
                <MdAddShoppingCart size={16} color="#FFF" />
                {cartItemsAmount[product.id] || 0}
              </div>

              <span>ADICIONAR AO CARRINHO</span>
            </button>
          </li>
        );
      })}
    </ProductList>
  );
};

export default Home;
