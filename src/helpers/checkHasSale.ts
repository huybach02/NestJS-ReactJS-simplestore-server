export const checkHasSale = (item: any) => {
  const now = new Date();
  const startDate = item.saleStartDate ? new Date(item.saleStartDate) : null;
  const endDate = item.saleEndDate ? new Date(item.saleEndDate) : null;
  return startDate && endDate && now >= startDate && now <= endDate;
};

export const checkProductHasVariantSale = (product: any) => {
  return product.variants.some(
    (variant) => variant.hasSale && checkHasSale(variant),
  );
};

export const countVariantSale = (product: any) => {
  return product.variants.filter(
    (variant) => variant.hasSale && checkHasSale(variant),
  ).length;
};
