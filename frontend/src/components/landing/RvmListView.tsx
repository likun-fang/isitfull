import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { Rvm, RvmStatus } from '../../types';
import { EmptyState } from './EmptyState';
import { RvmListItem } from './RvmListItem';
import { theme } from '../../theme';

interface Props {
  rvms: Rvm[] | undefined;
  isLoading: boolean;
  onRvmPress?: (rvm: Rvm) => void;
  onReport?: (rvmId: number, status: RvmStatus) => void;
}

export function RvmListView({ rvms, isLoading, onReport }: Props) {
  const renderItem: ListRenderItem<Rvm> = ({ item }) => (
    <RvmListItem
      rvm={item}
      onReport={onReport}
    />
  );

  const keyExtractor = (item: Rvm) => item.id.toString();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
      </View>
    );
  }

  if (!rvms || rvms.length === 0) {
    return <EmptyState />;
  }

  return (
    <FlatList
      data={rvms}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
  },
});
