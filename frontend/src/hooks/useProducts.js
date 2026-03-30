import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// 1. ADD 'deleteProduct' to your imports!
import { createProduct, getAllProducts, getProductById, deleteProduct, getMyProducts } from "../lib/api";

export const useProducts = () => {
  return useQuery({ queryKey: ["products"], queryFn: getAllProducts });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({ 
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });
};

export const useProduct = (id) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: !!id, 
  });
};

// 2. FIX this hook to use the actual API function
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => deleteProduct(id), // ✅ Calls the API function from lib/api
    onSuccess: () => {
      // 3. OPTIONAL: Refresh the list so the deleted product disappears immediately
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });
};

export const useMyProducts = () => {
  return useQuery({ queryKey: ["myProducts"], queryFn: getMyProducts });
};
