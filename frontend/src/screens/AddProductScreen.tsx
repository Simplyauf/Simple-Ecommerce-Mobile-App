import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "react-native-image-picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import { productsAPI, getCategories, uploadAPI } from "../services/api";
import { COLORS, FONTS } from "../theme/fonts";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";

interface ImageData {
  uri: string;
  type: string;
  name: string;
}

interface ProductForm {
  name: string;
  slug: string;
  brand: string;
  type: string;
  warrantyPeriod: string;
  startDate: Date;
  price: string;
  description: string;
  thumbnail: ImageData | null;
  categoryId: string;
  stock: string;
}

interface ApiResponse {
  errors: boolean;
  message: string;
  timestamp: string;
  data?: {
    product: any;
  };
}

interface ApiError {
  errors: boolean;
  message: string;
  timestamp: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export const AddProductScreen = ({ navigation }) => {
  const [product, setProduct] = useState<ProductForm>({
    name: "",
    slug: "",
    brand: "",
    type: "",
    warrantyPeriod: "",
    startDate: new Date(),
    price: "",
    description: "",
    thumbnail: null,
    categoryId: "",
    stock: "0",
  });
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [imageData, setImageData] = useState<ImageData | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await getCategories();
        console.log(response?.data);
        if (response?.data) {
          setCategories(response.data as any);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        Alert.alert("Error", "Failed to load categories. Please try again.", [
          { text: "OK" },
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleImagePick = () => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: "photo",
        quality: 0.8,
        includeBase64: false,
        selectionLimit: 1,
      },
      (response: ImagePicker.ImagePickerResponse) => {
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          console.log(asset);
          setProduct({
            ...product,
            thumbnail: {
              uri: asset.uri || "",
              type: asset.type || "image/jpeg",
              name: asset.fileName || "image.jpg",
            },
          });
        }
      }
    );
  };

  const resetForm = () => {
    setProduct({
      name: "",
      slug: "",
      brand: "",
      type: "",
      warrantyPeriod: "",
      startDate: new Date(),
      price: "",
      description: "",
      thumbnail: null,
      categoryId: "",
      stock: "0",
    });
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (
        !product.name.trim() ||
        !product.brand.trim() ||
        !product.price.trim() ||
        !product.type.trim() ||
        !product.stock.trim() ||
        !product.categoryId ||
        !product.warrantyPeriod.trim()
      ) {
        Alert.alert(
          "Validation Error",
          "Please fill in all required fields including category and warranty period",
          [{ text: "OK" }]
        );
        return;
      }

      const price = parseFloat(product.price);
      const stock = parseInt(product.stock);
      const warrantyPeriod = parseInt(product.warrantyPeriod);

      if (isNaN(price) || price <= 0) {
        Alert.alert("Validation Error", "Please enter a valid price", [
          { text: "OK" },
        ]);
        return;
      }

      if (isNaN(stock) || stock < 0) {
        Alert.alert("Validation Error", "Please enter a valid stock quantity", [
          { text: "OK" },
        ]);
        return;
      }

      if (isNaN(warrantyPeriod) || warrantyPeriod <= 0) {
        Alert.alert(
          "Validation Error",
          "Please enter a valid warranty period",
          [{ text: "OK" }]
        );
        return;
      }

      let imageUrl = null;

      const slug = product.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const productData = {
        ...product,
        slug,
      };

      delete productData.thumbnail;

      const response: any = await productsAPI.createProduct(productData as any);

      if ("errors" in response && response.errors === true) {
        Alert.alert("Error", response.message || "Failed to create product", [
          { text: "OK" },
        ]);
        return;
      }

      Alert.alert("Success", "Product created successfully!", [
        {
          text: "Add Another",
          onPress: resetForm,
          style: "cancel",
        },
        {
          text: "Done",
          onPress: () => navigation.goBack(),
          style: "default",
        },
      ]);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const errorData = err.response.data as ApiError;
        const errorMessage = errorData.message || "Failed to create product";

        if (err.response.status === 409) {
          Alert.alert("Product Already Exists", errorMessage, [{ text: "OK" }]);
        } else if (err.response.status === 413) {
          Alert.alert("Image Too Large", "Please choose a smaller image file", [
            { text: "OK" },
          ]);
        } else if (err.response.status === 422) {
          Alert.alert("Validation Error", errorMessage, [{ text: "OK" }]);
        } else {
          Alert.alert("Error", errorMessage, [{ text: "OK" }]);
        }

        setError(errorMessage);
      } else {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        Alert.alert("Error", errorMessage, [{ text: "OK" }]);
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Add New Product</Text>
        <Text style={styles.subtitle}>Enter product details</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* <TouchableOpacity
          style={styles.imageContainer}
          onPress={handleImagePick}
        > */}
        {/* {product.thumbnail ? (
            <Image
              source={{ uri: product.thumbnail.uri }}
              style={styles.image}
            />
          ) : (
            <View style={styles.uploadContainer}>
              <Icon
                name="cloud-upload"
                size={40}
                color={COLORS.TEXT_SECONDARY}
              />
              <Text style={styles.imagePlaceholder}>
                Tap to upload product image
              </Text>
            </View>
          )} */}
        {/* </TouchableOpacity> */}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter product name"
            value={product.name}
            onChangeText={(text) => setProduct({ ...product, name: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Brand *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter brand name"
            value={product.brand}
            onChangeText={(text) => setProduct({ ...product, brand: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Type *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter product type"
            value={product.type}
            onChangeText={(text) => setProduct({ ...product, type: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Warranty Period (months) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 12"
            keyboardType="numeric"
            value={product.warrantyPeriod}
            onChangeText={(text) =>
              setProduct({ ...product, warrantyPeriod: text })
            }
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Warranty Start Date</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.dateInputContent}>
              <Icon
                name="calendar-today"
                size={20}
                color={COLORS.TEXT_SECONDARY}
              />
              <Text style={styles.dateText}>
                {product.startDate.toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Stock *</Text>
          <TextInput
            style={styles.input}
            placeholder="Available quantity"
            keyboardType="numeric"
            value={product.stock}
            onChangeText={(text) => setProduct({ ...product, stock: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Price *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter price"
            keyboardType="decimal-pad"
            value={product.price}
            onChangeText={(text) => setProduct({ ...product, price: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter product description"
            multiline
            numberOfLines={4}
            value={product.description}
            onChangeText={(text) =>
              setProduct({ ...product, description: text })
            }
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category *</Text>
          {loadingCategories ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.PRIMARY} />
              <Text style={styles.loadingText}>Loading categories...</Text>
            </View>
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={product.categoryId}
                onValueChange={(itemValue) =>
                  setProduct({ ...product, categoryId: itemValue })
                }
                style={styles.picker}
                enabled={!isLoading}
              >
                <Picker.Item
                  label="Select a category"
                  value=""
                  style={styles.pickerPlaceholder}
                />
                {categories.map((category) => (
                  <Picker.Item
                    key={category.id}
                    label={category.name}
                    value={category.id.toString()}
                    style={styles.pickerItem}
                  />
                ))}
              </Picker>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.WHITE} />
          ) : (
            <Text style={styles.buttonText}>Add Product</Text>
          )}
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
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.TEXT,
    fontFamily: "ClashDisplay-Bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 32,
    fontFamily: FONTS.MEDIUM,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: COLORS.TEXT,
    marginBottom: 8,
    fontFamily: FONTS.MEDIUM,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 16,
    borderRadius: 8,
    fontFamily: FONTS.REGULAR,
    backgroundColor: COLORS.WHITE,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  imageContainer: {
    height: 200,
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    borderStyle: "dashed",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  uploadContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholder: {
    color: COLORS.TEXT_SECONDARY,
    marginTop: 8,
    fontFamily: FONTS.REGULAR,
  },
  dateInputContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateText: {
    color: COLORS.TEXT,
    fontFamily: FONTS.REGULAR,
  },
  button: {
    backgroundColor: COLORS.PRIMARY,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 30,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: FONTS.MEDIUM,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 14,
    fontFamily: FONTS.REGULAR,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    backgroundColor: COLORS.WHITE,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
    fontFamily: FONTS.REGULAR,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 16,
    borderRadius: 8,

    backgroundColor: COLORS.WHITE,
  },
  pickerItem: {
    fontFamily: FONTS.REGULAR,
    fontSize: 16,
  },
  pickerPlaceholder: {
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONTS.REGULAR,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
  },
  loadingText: {
    marginLeft: 10,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONTS.REGULAR,
  },
});
