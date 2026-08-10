import React from 'react';
import {
  Modal,
  Pressable,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { useLightbox } from '../hooks/useLightbox.js';

export interface LightboxProps<T> {
  items: T[];
  initialIndex?: number;
  onClose?: () => void;
  onIndexChange?: (index: number, item: T) => void;
  renderItem: (item: T, index: number) => React.ReactElement | null;
}

export function Lightbox<T>({
  items,
  initialIndex = 0,
  onClose,
  onIndexChange,
  renderItem,
}: LightboxProps<T>) {
  const lightbox = useLightbox({
    items,
    initialIndex,
    onClose,
    onIndexChange,
  });

  if (!lightbox.currentItem) {
    return null;
  }

  return (
    <Modal
      visible={lightbox.isOpen}
      transparent
      animationType="fade"
      onRequestClose={lightbox.close}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {renderItem(
            lightbox.currentItem,
            lightbox.currentIndex
          )}

          <View style={styles.controls}>
            <Pressable
              onPress={lightbox.prev}
              disabled={!lightbox.hasPrev}
            >
              <Text style={styles.control}>Previous</Text>
            </Pressable>

            <Pressable onPress={lightbox.close}>
              <Text style={styles.control}>Close</Text>
            </Pressable>

            <Pressable
              onPress={lightbox.next}
              disabled={!lightbox.hasNext}
            >
              <Text style={styles.control}>Next</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  control: {
    color: 'white',
    fontSize: 16,
  },
});
