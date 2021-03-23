import React, { useCallback, useMemo } from "react";
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from "react-icons/md";
import { useCart } from "../../hooks/useCart";

import { formatPrice } from "../../util/format";
import { Container, ProductTable, Total } from "./styles";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const total = useMemo(
    () =>
      formatPrice(
        cart.reduce((sumTotal, product) => {
          return sumTotal + product.price * product.amount;
        }, 0)
      ),
    [cart]
  );

  const handleProductIncrement = useCallback(
    (product: Product) => {
      updateProductAmount({
        productId: product.id,
        amount: product.amount + 1,
      });
    },
    [updateProductAmount]
  );

  const handleProductDecrement = useCallback(
    (product: Product) => {
      updateProductAmount({
        productId: product.id,
        amount: product.amount - 1,
      });
    },
    [updateProductAmount]
  );

  const handleRemoveProduct = useCallback(
    (productId: number) => {
      removeProduct(productId);
    },
    [removeProduct]
  );

  const cartFormatted = useMemo(
    () =>
      cart.map((item: Product) => {
        return {
          subtotal: formatPrice(Number(item.price) * Number(item.amount)),
          amount: item.amount,
          product: {
            ...item,
            priceFormatted: formatPrice(item.price),
          },
        };
      }),
    [cart]
  );

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormatted?.map((product) => {
            return (
              <tr data-testid="product" key={product.product.id}>
                <td>
                  <img
                    src={product.product.image}
                    alt={product.product.title}
                  />
                </td>
                <td>
                  <strong>{product.product.title}</strong>
                  <span>{product.product.priceFormatted}</span>
                </td>
                <td>
                  <div>
                    <button
                      type="button"
                      data-testid="decrement-product"
                      disabled={product.product.amount <= 1}
                      onClick={() => handleProductDecrement(product.product)}
                    >
                      <MdRemoveCircleOutline size={20} />
                    </button>
                    <input
                      type="text"
                      data-testid="product-amount"
                      readOnly
                      value={product.product.amount}
                    />
                    <button
                      type="button"
                      data-testid="increment-product"
                      onClick={() => handleProductIncrement(product.product)}
                    >
                      <MdAddCircleOutline size={20} />
                    </button>
                  </div>
                </td>
                <td>
                  <strong>{product.subtotal}</strong>
                </td>
                <td>
                  <button
                    type="button"
                    data-testid="remove-product"
                    onClick={() => handleRemoveProduct(product.product.id)}
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
