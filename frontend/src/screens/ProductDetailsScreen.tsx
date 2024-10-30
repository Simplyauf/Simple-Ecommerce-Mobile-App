import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { productsAPI } from "../services/api";
import { Loader } from "../components/Loader";
import { COLORS, FONTS } from "../theme/fonts";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";

type RootStackParamList = {
  ProductDetails: { productId: number };
};

type ProductDetailsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, "ProductDetails">;
  route: RouteProp<RootStackParamList, "ProductDetails">;
};

interface ProductResponse {
  id: number;
  name: string;
  slug: string;
  brand: string;
  type: string;
  warranty_period: string | null;
  start_date: string | null;
  description: string;
  price: string;
  image_url: string | null;
  category_id: number | null;
  stock: number;
  created_at: string;
  updated_at: string;
  category_name: string | null;
}

export const ProductDetailsScreen = ({
  route,
  navigation,
}: ProductDetailsScreenProps) => {
  const { productId } = route.params;
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProduct(productId.toString());
      setProduct(response.data?.data);
    } catch (error) {
      console.error("Error fetching product details:", error);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!product) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      {product.image_url ? (
        <Image source={{ uri: product.image_url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholderContainer]}>
          <Icon name="image" size={40} color="#666" />
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.brand}>Brand: {product.brand}</Text>
        <Text style={styles.type}>Type:&nbsp;{product.type}</Text>
        <Text style={styles.price}>${product.price}</Text>

        {product.stock > 0 ? (
          <View style={styles.stockContainer}>
            <Icon name="inventory" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.stockText}>
              In Stock: {product.stock} units
            </Text>
          </View>
        ) : (
          <Text style={styles.outOfStock}>Out of Stock</Text>
        )}

        {product.warranty_period && (
          <View style={styles.warrantyContainer}>
            <Icon name="verified-user" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.warrantyText}>
              {product.warranty_period} warranty
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{product.description}</Text>

        {product.category_name && (
          <>
            <Text style={styles.sectionTitle}>Category</Text>
            <Text style={styles.categoryName}>{product.category_name}</Text>
          </>
        )}

        <TouchableOpacity
          style={[styles.button, !product.stock && styles.buttonDisabled]}
          disabled={!product.stock}
        >
          <Text style={styles.buttonText}>
            {product.stock ? "Add to Cart" : "Out of Stock"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "ClashDisplay-Bold",
  },
  productRow: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  addButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.WHITE,
    fontWeight: "600",
    fontFamily: FONTS.MEDIUM,
  },
  placeholderContainer: {
    backgroundColor: "darkgray",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 300,
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "ClashDisplay-Bold",
    color: COLORS.TEXT,
  },
  brand: {
    fontSize: 18,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 5,
    fontFamily: FONTS.MEDIUM,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
    marginTop: 10,
    fontFamily: "ClashDisplay-Bold",
  },
  warrantyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    padding: 10,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 8,
  },
  warrantyText: {
    marginLeft: 8,
    color: COLORS.TEXT,
    fontFamily: FONTS.MEDIUM,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    fontFamily: "ClashDisplay-Bold",
    color: COLORS.TEXT,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONTS.REGULAR,
  },
  button: {
    backgroundColor: COLORS.PRIMARY,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
  },
  type: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 5,
    fontFamily: FONTS.MEDIUM,
  },
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    padding: 10,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 8,
  },
  stockText: {
    marginLeft: 8,
    color: COLORS.TEXT,
    fontFamily: FONTS.MEDIUM,
  },
  outOfStock: {
    color: "red",
    fontFamily: FONTS.MEDIUM,
    marginTop: 15,
  },
  categoryName: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONTS.REGULAR,
  },
  buttonDisabled: {
    backgroundColor: COLORS.TEXT_SECONDARY,
    opacity: 0.5,
  },
});
