import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Text,
  Image,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS, FONTS } from "../theme/fonts";
import { productsAPI, categoriesAPI } from "../services/api";
import { ProductCard } from "../components/ProductCard";
import { SearchBar } from "../components/SearchBar";

export const ShopScreen = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  console.log(categories);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [sortBy, filterBy, page, debouncedSearch]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProducts({
        category: filterBy !== "all" ? filterBy : undefined,
        sort: sortBy as "newest" | "price_asc" | "price_desc",
        page,
        limit: 10,
      });
      console.log(response?.data);
      setProducts((prev) =>
        page === 1
          ? response?.data?.data?.products
          : [...prev, ...response.data?.data?.products]
      );
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories();
      console.log(response?.data);
      setCategories(response?.data?.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const sortOptions = [
    { label: "Newest", value: "newest" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
  ];

  const handleSort = (value) => {
    setSortBy(value);
    setPage(1);
    setShowSort(false);
  };

  const handleFilter = (category) => {
    setFilterBy(category);
    setPage(1);
    setShowFilters(false);
  };

  const renderSortModal = () => (
    <Modal
      visible={showSort}
      animationType="slide"
      transparent
      onRequestClose={() => setShowSort(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sort By</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSort(false)}
            >
              <Icon name="close" size={24} color={COLORS.TEXT} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionItem,
                  sortBy === option.value && styles.selectedOption,
                ]}
                onPress={() => handleSort(option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    sortBy === option.value && styles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </Text>
                {sortBy === option.value && (
                  <Icon name="check" size={20} color={COLORS.PRIMARY} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter By Category</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFilters(false)}
            >
              <Icon name="close" size={24} color={COLORS.TEXT} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            <TouchableOpacity
              style={[
                styles.optionItem,
                filterBy === "all" && styles.selectedOption,
              ]}
              onPress={() => handleFilter("all")}
            >
              <Text
                style={[
                  styles.optionText,
                  filterBy === "all" && styles.selectedOptionText,
                ]}
              >
                All Categories
              </Text>
              {filterBy === "all" && (
                <Icon name="check" size={20} color={COLORS.PRIMARY} />
              )}
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.optionItem,
                  filterBy === category.id && styles.selectedOption,
                ]}
                onPress={() => handleFilter(category.name)}
              >
                <Text
                  style={[
                    styles.optionText,
                    filterBy === category.id && styles.selectedOptionText,
                  ]}
                >
                  {category.name}
                </Text>
                {filterBy === category.id && (
                  <Icon name="check" size={20} color={COLORS.PRIMARY} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.BACKGROUND} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop</Text>

        {/* Add SearchBar */}
        <SearchBar
          value={searchQuery}
          onSearch={setSearchQuery}
          onClear={handleClearSearch}
          placeholder="Search products..."
          products={products}
        />

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Icon name="filter-list" size={20} color={COLORS.TEXT} />
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowSort(true)}
          >
            <Icon name="sort" size={20} color={COLORS.TEXT} />
            <Text style={styles.filterButtonText}>Sort</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Filters */}
      {filterBy !== "all" && (
        <View style={styles.activeFilterContainer}>
          <View style={styles.activeFilterPill}>
            <Text style={styles.activeFilterText}>Category: {filterBy}</Text>
            <TouchableOpacity onPress={() => setFilterBy("all")}>
              <Icon name="close" size={16} color={COLORS.PRIMARY} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Products Grid */}
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => {
              console.log("Product pressed:", item.slug);
            }}
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
      />

      {renderFilterModal()}
      {renderSortModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: FONTS.BOLD,
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 12,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    gap: 4,
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    color: COLORS.TEXT,
  },
  activeFilterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  activeFilterPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.PRIMARY}15`,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 8,
  },
  activeFilterText: {
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    color: COLORS.PRIMARY,
  },
  productList: {
    padding: 16,
  },
  productRow: {
    justifyContent: "space-between",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.SEMIBOLD,
  },
  closeButton: {
    padding: 4,
  },
  modalScroll: {
    padding: 16,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedOption: {
    backgroundColor: `${COLORS.PRIMARY}10`,
  },
  optionText: {
    fontSize: 16,
    fontFamily: FONTS.REGULAR,
    color: COLORS.TEXT,
  },
  selectedOptionText: {
    fontFamily: FONTS.MEDIUM,
    color: COLORS.PRIMARY,
  },
});
