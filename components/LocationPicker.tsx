import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { MapPin, ChevronDown, X } from 'lucide-react-native';
import { COLORS, FONT, SIZES, SHADOWS } from '../constants/theme';

interface LocationPickerProps {
  label: string;
  value: string;
  locations: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

const LocationPicker = ({
  label,
  value,
  locations,
  onChange,
  placeholder = 'Select location',
  error,
}: LocationPickerProps) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(
    locations.map(location => ({
      label: location,
      value: location,
    }))
  );

  // Update items when locations change
  useEffect(() => {
    setItems(
      locations.map(location => ({
        label: location,
        value: location,
      }))
    );
  }, [locations]);

  const clearSelection = () => {
    onChange('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <View style={styles.inputContainer}>
        <MapPin 
          size={20} 
          color={COLORS.primary[500]} 
          style={styles.icon} 
        />
        
        <DropDownPicker
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={(callback) => {
            const newValue = typeof callback === 'function' ? callback(value) : callback;
            onChange(newValue);
          }}
          setItems={setItems}
          placeholder={placeholder}
          style={[
            styles.dropdown,
            error ? styles.inputError : null,
          ]}
          dropDownContainerStyle={styles.dropdownContainer}
          textStyle={styles.dropdownText}
          placeholderStyle={styles.placeholderText}
          ArrowDownIconComponent={() => (
            <ChevronDown size={20} color={COLORS.neutral[600]} />
          )}
          ArrowUpIconComponent={() => (
            <ChevronDown size={20} color={COLORS.primary[500]} style={{ transform: [{ rotate: '180deg' }] }} />
          )}
          CloseIconComponent={() => (
            <X size={20} color={COLORS.neutral[600]} />
          )}
          showTickIcon={false}
          searchable={true}
          searchPlaceholder="Search location..."
          searchContainerStyle={styles.searchContainer}
          searchTextInputStyle={styles.searchInput}
          listMode="MODAL"
          modalContentContainerStyle={styles.modalContent}
          modalTitle={`Select ${label.toLowerCase()}`}
          listItemLabelStyle={styles.listItemLabel}
          selectedItemLabelStyle={styles.selectedItemLabel}
          selectedItemContainerStyle={styles.selectedItemContainer}
        />
        
        {value ? (
          <TouchableOpacity style={styles.clearButton} onPress={clearSelection}>
            <X size={16} color={COLORS.neutral[500]} />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.m,
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: 16,
    color: COLORS.neutral[700],
    marginBottom: SIZES.xs,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: SIZES.m,
    zIndex: 10,
  },
  dropdown: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: SIZES.s,
    paddingVertical: SIZES.m,
    paddingLeft: SIZES.xl + SIZES.xs, // Space for icon
    backgroundColor: COLORS.white,
    minHeight: 55,
    ...SHADOWS.small,
  },
  inputError: {
    borderColor: COLORS.error[500],
    borderWidth: 1,
  },
  dropdownContainer: {
    borderColor: COLORS.neutral[300],
    borderWidth: 1,
    ...SHADOWS.medium,
  },
  dropdownText: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.neutral[800],
  },
  placeholderText: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.neutral[500],
  },
  searchContainer: {
    borderBottomColor: COLORS.neutral[200],
    paddingHorizontal: SIZES.s,
  },
  searchInput: {
    borderColor: COLORS.neutral[300],
    borderWidth: 1,
    borderRadius: SIZES.xs,
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.neutral[800],
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.m,
    padding: SIZES.s,
  },
  listItemLabel: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.neutral[800],
  },
  selectedItemLabel: {
    fontFamily: FONT.medium,
    color: COLORS.primary[500],
  },
  selectedItemContainer: {
    backgroundColor: COLORS.primary[50],
  },
  clearButton: {
    position: 'absolute',
    right: SIZES.m,
    padding: SIZES.xs,
    zIndex: 10,
  },
  errorText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.error[500],
    marginTop: SIZES.xs,
  },
});

export default LocationPicker;