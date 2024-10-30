import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Keyboard,
  FlatList,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FONTS, COLORS } from "../theme/fonts";

interface SearchBarProps {
  value: string;
  onSearch: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  products?: any[];
}

export const SearchBar = ({
  value,
  onSearch,
  onClear,
  placeholder,
  products,
}: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const animatedHeight = new Animated.Value(0);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  useEffect(() => {
    if ((suggestions.length > 0 || recentSearches.length > 0) && isFocused) {
      Animated.timing(animatedHeight, {
        toValue: 300,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [isFocused, suggestions.length, recentSearches.length]);

  const loadRecentSearches = async () => {
    try {
      const searches = await AsyncStorage.getItem("recentSearches");
      if (searches) {
        setRecentSearches(JSON.parse(searches));
      }
    } catch (error) {
      console.error("Error loading recent searches:", error);
    }
  };

  const saveRecentSearch = async (query: string) => {
    try {
      const updatedSearches = [
        query,
        ...recentSearches.filter((item) => item !== query),
      ].slice(0, 5);

      await AsyncStorage.setItem(
        "recentSearches",
        JSON.stringify(updatedSearches)
      );
      setRecentSearches(updatedSearches);
    } catch (error) {
      console.error("Error saving recent search:", error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim()) {
      const filtered = products
        .filter((product) =>
          product.name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmitSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      saveRecentSearch(searchQuery);
      Keyboard.dismiss();
      setIsFocused(false);
    }
  };

  const handleSelectSuggestion = (item: any) => {
    setSearchQuery(item.name);
    onSearch(item.name);
    saveRecentSearch(item.name);
    Keyboard.dismiss();
    setIsFocused(false);
  };

  const handleSelectRecentSearch = (search: string) => {
    setSearchQuery(search);
    onSearch(search);
    Keyboard.dismiss();
    setIsFocused(false);
  };

  const clearRecentSearches = async () => {
    try {
      await AsyncStorage.removeItem("recentSearches");
      setRecentSearches([]);
    } catch (error) {
      console.error("Error clearing recent searches:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View
        style={[
          styles.searchContainer,
          isFocused && styles.searchContainerFocused,
        ]}
      >
        <Icon name="search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={[styles.input, isFocused && styles.inputFocused]}
          value={searchQuery}
          onChangeText={handleSearch}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          placeholderTextColor="#999"
          returnKeyType="search"
          onSubmitEditing={handleSubmitSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery("");
              onClear();
              setSuggestions([]);
            }}
            style={styles.clearButton}
          >
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions and Recent Searches */}
      {(suggestions.length > 0 || recentSearches.length > 0) && isFocused && (
        <Animated.View
          style={[styles.suggestionsContainer, { maxHeight: animatedHeight }]}
        >
          <View style={styles.suggestionsContent}>
            {/* Suggestions */}
            {suggestions.length > 0 ? (
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => handleSelectSuggestion(item)}
                  >
                    <Icon name="search" size={20} color="#666" />
                    <Text style={styles.suggestionText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              recentSearches.length > 0 && (
                <>
                  <View style={styles.recentHeader}>
                    <Text style={styles.recentTitle}>Recent Searches</Text>
                    <TouchableOpacity onPress={clearRecentSearches}>
                      <Text style={styles.clearText}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={recentSearches}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.suggestionItem}
                        onPress={() => handleSelectRecentSearch(item)}
                      >
                        <Icon name="history" size={20} color="#666" />
                        <Text style={styles.suggestionText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </>
              )
            )}
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputFocused: {
    borderWidth: 0,
    borderColor: "transparent",
  },
  searchContainerFocused: {
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",

    fontFamily: FONTS.CLASH_DISPLAY_REGULAR,
    padding: 0,
    margin: 0,
  },
  clearButton: {
    padding: 4,
  },
  suggestionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 8,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  suggestionsContent: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
    fontFamily: FONTS.CLASH_DISPLAY_REGULAR,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    fontFamily: FONTS.CLASH_DISPLAY_MEDIUM,
  },
  clearText: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.CLASH_DISPLAY_MEDIUM,
  },
});
