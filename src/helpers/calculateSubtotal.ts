import { checkHasSale } from './checkHasSale';

export const calculateSubtotal = (item: any) => {
  if (!item.product.hasVariant) {
    if (item.product.hasSale && checkHasSale(item.product)) {
      return (
        item.product?.salePrice && item.product?.salePrice * item.buyQuantity
      );
    } else {
      return (
        item.product?.originalPrice &&
        item.product?.originalPrice * item.buyQuantity
      );
    }
  } else {
    if (item.variant?.hasSale && checkHasSale(item.variant)) {
      return (
        item.variant?.salePrice && item.variant?.salePrice * item.buyQuantity
      );
    } else {
      return (
        item.variant?.originalPrice &&
        item.variant?.originalPrice * item.buyQuantity
      );
    }
  }
};

export const calculateTotal = (selectedItems: any[]) => {
  let total = 0;

  selectedItems.forEach((item) => {
    total += calculateSubtotal(item) || 0;
  });

  return total;
};
