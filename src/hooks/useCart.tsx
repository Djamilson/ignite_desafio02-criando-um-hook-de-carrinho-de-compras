import {
  createContext,
  ReactNode,
  useCallback,
  useState,
  useContext,
} from "react";

import { api } from "../services/api";
import { Product } from "../types";

import { toast } from "react-toastify";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  clearCart(): void;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

//const CartProvider: React.FC = ({ children }) => {

function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const productList = localStorage.getItem("@RocketShoes:cart");

    if (productList) {
      return JSON.parse(productList);
    }

    return [] as Product[];
  });

  const clearCart = useCallback(() => {
    localStorage.removeItem("@RocketShoes:cart");
    setCart([] as Product[]);
  }, []);

  const updateSuccess = useCallback(
    async (id, stock) => {
      const newCart = cart;

      const productIndex = newCart.findIndex((p) => p.id === id);

      if (productIndex >= 0) {
        if (Number(newCart[productIndex].amount) < Number(stock)) {
          toast.success("Produto adicionado ao carrinho com sucesso!");
        } else {
          toast.success("Produto removido do carrinho com sucesso!");
        }

        newCart[productIndex].amount = Number(stock);

        setCart([...newCart]);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
      }
    },
    [cart]
  );

  const updateProductAmount = useCallback(
    async ({ productId, amount }: UpdateProductAmount) => {
      try {
        if (amount <= 1) {
          toast.error("Erro na alteração de quantidade do produto");
          return;
        }

        const response = await api.get(`/stock/${productId}`);
        const productAmount = response.data.amount;
      
        if (Number(amount) > Number(productAmount)) {
          toast.error("Quantidade solicitada fora de estoque");
          return;
        }

        updateSuccess(productId, amount);
      } catch (error) {
        toast.error("Erro na alteração de quantidade do produto");
      }
    },
    [updateSuccess]
  );

  const addProduct = async (productId: number) => {
    try {
      const newCart = cart;

      const productExists = newCart.find((p: Product) => p.id === productId);

      const stock = await api.get(`/stock/${productId}`);

      const stockAmount = stock.data.amount;
      const currentAmount = productExists ? productExists.amount : 0;

      const amount = currentAmount + 1;

      if (amount > stockAmount) {
        toast.error("Não temos mais produto para adicionar!");
        return;
      }

      if (productExists) {
        updateSuccess(productId, amount);
      } else {
        const res = await api.get(`/products/${productId}`);

        const { data } = res;

        const item = { amount: 1, ...data };

        newCart.push(item);

        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));

        setCart([...newCart]);
        toast.success("Produto adicionado ao carrinho com sucesso!");
      }
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = useCallback(
    async (id) => {
      try {
        const removeCart = cart;

        const productExists = removeCart.some(
          (cartProduct) => cartProduct.id === id
        );

        if (!productExists) {
          toast.error("Erro na remoção do produto");
          return;
        }

        const productIndex = removeCart.findIndex((p) => p.id === id);

        if (productIndex >= 0) {
          removeCart.splice(productIndex, 1);
          setCart([...removeCart]);
          localStorage.setItem("@RocketShoes:cart", JSON.stringify(removeCart));
        }
      } catch (error) {
        toast.error("Erro na remoção do produto");
      }
    },
    [cart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addProduct,
        updateProductAmount,
        removeProduct,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

function useCart(): CartContextData {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useProduct mus be used within an CartProduct");
  }

  return context;
}

export { CartProvider, useCart };
