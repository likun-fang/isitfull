import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Rvm } from '../../types';
import { StatusBadge } from './StatusBadge';
import { LiveDistance } from '../common/LiveDistance';

interface Props {
  rvm: Rvm;
  onPress?: () => void;
  onReport?: () => void;
}

export function RvmCard({ rvm, onPress, onReport }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.name} numberOfLines={1}>{rvm.name}</Text>
          <Text style={styles.location}>{rvm.city}</Text>
        </View>
        <StatusBadge status={rvm.status} size="small" />
      </View>

      <View style={styles.footer}>
        <View style={styles.distanceContainer}>
          <Feather name="map-pin" size={14} color="#6B7280" />
          <LiveDistance
            targetLat={rvm.lat}
            targetLng={rvm.lng}
            format="short"
            style={styles.distance}
          />
        </View>

        {onReport && (
          <TouchableOpacity style={styles.reportButton} onPress={onReport}>
            <Feather name="flag" size={16} color="#22C55E" />
            <Text style={styles.reportText}>Report</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distance: {
    fontSize: 14,
    color: '#6B7280',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
  },
  reportText: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '500',
  },
});
