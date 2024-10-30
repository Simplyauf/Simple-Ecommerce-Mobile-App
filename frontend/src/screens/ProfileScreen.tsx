import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  RefreshControl,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "react-native-image-picker";

export const ProfileScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [profileImage, setProfileImage] = useState(
    "https:
  );

  
  const userData = {
    name: "John Doe",
    email: "john.doe@example.com",
    productsListed: 12,
    joinDate: "March 2024",
    verificationStatus: "Verified",
  };

  const stats = [
    { label: "Products", value: userData.productsListed },
    { label: "Member Since", value: userData.joinDate },
    { label: "Status", value: userData.verificationStatus },
  ];

  const menuItems = [
    {
      title: "Account",
      items: [
        {
          icon: "person",
          label: "Edit Profile",
          action: () => navigation.navigate("EditProfile"),
        },
        {
          icon: "security",
          label: "Change Password",
          action: () => navigation.navigate("ChangePassword"),
        },
        {
          icon: "verified-user",
          label: "Verification Status",
          action: () => Alert.alert("Verified", "Your account is verified"),
        },
      ],
    },
    {
      title: "Products",
      items: [
        {
          icon: "list",
          label: "My Products",
          action: () => navigation.navigate("MyProducts"),
        },
        {
          icon: "favorite",
          label: "Saved Products",
          action: () => navigation.navigate("SavedProducts"),
        },
        {
          icon: "history",
          label: "Recently Viewed",
          action: () => navigation.navigate("RecentlyViewed"),
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          icon: "notifications",
          label: "Notifications",
          action: () => navigation.navigate("Notifications"),
        },
        {
          icon: "language",
          label: "Language",
          action: () => navigation.navigate("Language"),
        },
        {
          icon: "help",
          label: "Help & Support",
          action: () => navigation.navigate("Support"),
        },
      ],
    },
  ];

  const handleImagePick = () => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: "photo",
        quality: 0.8,
      },
      (response) => {
        if (response.assets && response.assets[0].uri) {
          setProfileImage(response.assets[0].uri);
        }
      }
    );
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        },
      },
    ]);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleImagePick}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: profileImage }} style={styles.avatar} />
            <View style={styles.editIconContainer}>
              <Icon name="edit" size={16} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>

        <Text style={styles.name}>{userData.name}</Text>
        <Text style={styles.email}>{userData.email}</Text>

        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {menuItems.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity
              key={itemIndex}
              style={styles.menuItem}
              onPress={item.action}
            >
              <Icon name={item.icon} size={24} color="#007AFF" />
              <Text style={styles.menuText}>{item.label}</Text>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={24} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff",
  },
  editIconContainer: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#2FBE7A",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  section: {
    backgroundColor: "#f9f9f9",
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: "#333",
  },
  logoutButton: {
    flexDirection: "row",
    margin: 20,
    backgroundColor: "#ff3b30",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  version: {
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
    fontSize: 12,
  },
});
