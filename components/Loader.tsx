import React, { useState, useEffect } from 'react';
import { Modal, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LoaderProps {
  visible: boolean;
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  status: 'loading' | 'success' | 'error';
}

const Loader: React.FC<LoaderProps> = ({ visible, loadingMessage = "Carregando...", successMessage = null, errorMessage = "Ocorreu um erro", status }) => {
  const [showModal, setShowModal] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShowModal(true);
    } else {
      setTimeout(() => setShowModal(false), 2500);
    }
  }, [visible]);

  const renderContent = () => {
    switch (status) {
      case 'success':
        return (
          <>
            <Ionicons name="checkmark-circle" size={64} color="green" />
            <Text style={styles.message}>{successMessage}</Text>
          </>
        );
      case 'error':
        return (
          <>
            <Ionicons name="close-circle" size={64} color="red" />
            <Text style={styles.message}>{errorMessage}</Text>
          </>
        );
      default:
        return (
          <>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.message}>{loadingMessage}</Text>
          </>
        );
    }
  };

  return (
    <Modal transparent={true} animationType="fade" visible={showModal} onRequestClose={() => setShowModal(false)}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>{renderContent()}</View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 200,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Loader;
