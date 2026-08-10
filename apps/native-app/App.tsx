import React from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { MediaProvider, useMediaList } from 'media-native';
import { Grid } from 'media-ui-native';

const PEXELS_API_KEY = 'YOUR_PEXELS_API_KEY';

function MediaScreen() {
  const { items, loading, error, loadMore, hasNextPage, loadingMore } =
    useMediaList(
      {
        kind: 'curated-photos',
      },
      {
        perPage: 20,
      },
    );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading photos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Media SDK</Text>

      <Grid
        items={items}
        numColumns={2}
        keyExtractor={(item) => item.id}
        hasNextPage={hasNextPage}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
        renderItem={(item) => (
          <Image
            source={{ uri: item.thumbnailUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <MediaProvider
      apiKey={PEXELS_API_KEY}
      enableDefaultLogging
    >
      <MediaScreen />
    </MediaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    padding: 16,
  },

  image: {
    flex: 1,
    height: 180,
    margin: 4,
    borderRadius: 8,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  error: {
    color: 'red',
    textAlign: 'center',
  },
});

