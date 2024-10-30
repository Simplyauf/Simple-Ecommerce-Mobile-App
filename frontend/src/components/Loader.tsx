import React from "react";
import { View, ActivityIndicator, StyleSheet, Text, Modal } from "react-native";
import { COLORS, FONTS } from "../theme/fonts";

interface LoaderProps {
  loading?: boolean;
  message?: string;
  fullScreen?: boolean;
}

export const Loader = ({
  loading = true,
  message,
  fullScreen = false,
}: LoaderProps) => {
  if (fullScreen) {
    return (
      <Modal transparent visible={loading}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            {message && <Text style={styles.message}>{message}</Text>}
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  message: {
    marginTop: 10,
    color: COLORS.TEXT,
    fontFamily: FONTS.MEDIUM,
    textAlign: "center",
  },
});
