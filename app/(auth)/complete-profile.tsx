import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { colors } from '@/constants/colors';
import { commonStyles, spacing, borderRadius, fontSize } from '@/constants/styles';
import { Location as LocationType } from '@/types/database';

export default function CompleteProfileScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationType | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const user = useAuthStore(state => state.user);
  const updateProfile = useAuthStore(state => state.updateProfile);
  const router = useRouter();

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      getLocation();
    }
  };

  const getLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Reverse geocode to get address
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      setLocation({
        latitude,
        longitude,
        address: `${address.street || ''}, ${address.city || ''}, ${address.country || ''}`,
        city: address.city || undefined,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uri: string): Promise<string | null> => {
    try {
      if (!user) return null;

      setUploadingPhoto(true);

      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      const fileExt = uri.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, blob, {
          upsert: true,
          contentType: 'image/*',
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      setUploadingPhoto(false);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      setUploadingPhoto(false);
      return null;
    }
  };

  const handleComplete = async () => {
    setLoading(true);

    let photoUrl = null;
    if (photoUri) {
      photoUrl = await uploadPhoto(photoUri);
    }

    const updates: any = {};
    if (photoUrl) updates.photo_url = photoUrl;
    if (location) updates.location = location;

    const { error } = await updateProfile(updates);

    setLoading(false);

    if (error) {
      Alert.alert('Error', error);
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              Add a photo and set your location to get started
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.photoSection}>
              <Text style={styles.label}>Profile Photo</Text>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={pickImage}
                disabled={loading || uploadingPhoto}
              >
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photo} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderText}>+</Text>
                    <Text style={styles.photoLabel}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.locationSection}>
              <Text style={styles.label}>Location</Text>
              <View style={styles.locationCard}>
                {location ? (
                  <>
                    <Text style={styles.locationText}>{location.city}</Text>
                    <Text style={styles.locationSubtext} numberOfLines={2}>
                      {location.address}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.locationSubtext}>Getting your location...</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={getLocation}
                disabled={loading}
              >
                <Text style={styles.refreshButtonText}>Refresh Location</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[commonStyles.primaryButton, styles.button]}
              onPress={handleComplete}
              disabled={loading || uploadingPhoto}
            >
              <Text style={commonStyles.buttonText}>
                {loading || uploadingPhoto ? 'Setting Up...' : 'Complete Profile'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              disabled={loading || uploadingPhoto}
            >
              <Text style={styles.skipButtonText}>Skip for Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.xxl,
  },
  header: {
    marginTop: spacing.xxxl * 2,
    marginBottom: spacing.xxxl,
  },
  title: {
    fontSize: fontSize.xxxl + 8,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    lineHeight: 26,
  },
  form: {
    gap: spacing.xxl,
  },
  photoSection: {
    alignItems: 'center',
    gap: spacing.md,
  },
  label: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  photoButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    fontSize: fontSize.xxxl * 2,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  photoLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  locationSection: {
    gap: spacing.md,
  },
  locationCard: {
    backgroundColor: colors.cardBackground,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationText: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  locationSubtext: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  refreshButton: {
    alignSelf: 'flex-start',
  },
  refreshButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },
  button: {
    marginTop: spacing.lg,
  },
  skipButton: {
    alignSelf: 'center',
  },
  skipButtonText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});

