import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../theme/fonts";
import Icon from "react-native-vector-icons/MaterialIcons";

export const ProductCard = ({ product, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      {product.thumbnail ? (
        <Image source={{ uri: product.thumbnail }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholderContainer]}>
          <Icon name="image" size={40} color="#666" />
        </View>
      )}
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.price}>{product.price}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  details: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "ClashDisplay",
  },
  brand: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    fontFamily: "ClashDisplay",
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.PRIMARY,
    fontFamily: "ClashDisplay",
    marginTop: 8,
  },
  placeholderContainer: {
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
});
