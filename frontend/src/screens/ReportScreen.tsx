import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { RvmStatus, Rvm } from '../types';
import { STATUS_CONFIG } from '../utils/statusColor';
import { useLocation } from '../hooks/useLocation';
import { useReportStatus } from '../hooks/useReportStatus';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface Props {
  rvm: Rvm;
  onClose: () => void;
  onSuccess: () => void;
}

const REPORT_OPTIONS: RvmStatus[] = ['AVAILABLE', 'BUSY', 'BROKEN'];

export function ReportScreen({ rvm, onClose, onSuccess }: Props) {
  const [selectedStatus, setSelectedStatus] = useState<RvmStatus | null>(null);
  const { location } = useLocation();
  const { mutate, isPending } = useReportStatus(rvm.id);

  const handleSubmit = () => {
    if (!selectedStatus || !location) return;

    mutate(
      {
        status: selectedStatus,
        latitude: location.latitude,
        longitude: location.longitude,
      },
      {
        onSuccess: (result) => {
          Alert.alert('Success', result.response.message, [{ text: 'OK', onPress: onSuccess }]);
        },
        onError: (error: any) => {
          const message = error.response?.data?.message || error.message;
          Alert.alert('Error', message);
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Feather name="x" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Report Status</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.rvmName}>{rvm.name}</Text>
      <Text style={styles.subtitle}>What is the current status?</Text>

      <View style={styles.options}>
        {REPORT_OPTIONS.map((status) => {
          const config = STATUS_CONFIG[status];
          const isSelected = selectedStatus === status;

          return (
            <TouchableOpacity
              key={status}
              style={[
                styles.option,
                isSelected && { borderColor: config.color, backgroundColor: `${config.color}10` },
              ]}
              onPress={() => setSelectedStatus(status)}
            >
              <View style={[styles.radio, isSelected && { borderColor: config.color }]}>
                {isSelected && <View style={[styles.radioInner, { backgroundColor: config.color }]} />}
              </View>
              <Feather name={config.icon as any} size={20} color={config.color} />
              <Text style={styles.optionLabel}>{config.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, !selectedStatus && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!selectedStatus || isPending}
      >
        {isPending ? (
          <LoadingSpinner size="small" color="white" />
        ) : (
          <Text style={styles.submitText}>Submit Report</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  rvmName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  options: {
    paddingHorizontal: 16,
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  submitButton: {
    backgroundColor: '#22C55E',
    marginHorizontal: 16,
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
