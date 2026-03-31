import axios from "axios";

// Swapped localhost for 127.0.0.1 to bypass Node IPv6 resolution issues
const API_BASE_URL = "http://127.0.0.1:6002/api";

export const fetchProducts = async () => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/get-all-products`);
    
    return data.products.map((p: any) => {
      const discount = p.regular_price > p.sale_price 
        ? Math.round(((p.regular_price - p.sale_price) / p.regular_price) * 100) 
        : 0;

      return {
        ...p,
        price: p.sale_price,
        mrp: p.regular_price,
        discount: discount,
        displayImage: p.images?.[0]?.url || "/placeholder.svg",
        unitLabel: p.subCategory || "Standard"
      };
    });
  } catch (error) {
    console.warn("API Unreachable: Is product-service running on port 6002?");
    return []; // Ensures it always returns an array, fixing your .filter() error
  }
};