import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useAuthStore } from '@/stores/authStore';
import { useRidesStore } from '@/stores/ridesStore';
import { supabase } from '@/lib/supabase';
import { colors } from '@/constants/colors';
import { spacing, borderRadius, fontSize } from '@/constants/styles';
import { Location as LocationType } from '@/types/database';

export default function ProfileScreen() {
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);
  const updateProfile = useAuthStore(state => state.updateProfile);
  const signOut = useAuthStore(state => state.signOut);
  const myRides = useRidesStore(state => state.myRides);
  const fetchMyRides = useRidesStore(state => state.fetchMyRides);
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyRides(user.id);
    }
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0] && user) {
      setLoading(true);
      const uri = result.assets[0].uri;
      
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, blob, { upsert: true, contentType: 'image/*' });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(filePath);

        await updateProfile({ photo_url: publicUrl });
      }
      
      setLoading(false);
    }
  };

  const updateLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need access to your location');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });

      const locationData: LocationType = {
        latitude,
        longitude,
        address: `${address.city || ''}, ${address.country || ''}`,
        city: address.city || undefined,
      };

      await updateProfile({ location: locationData });
      Alert.alert('Updated', 'Location updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update location');
    }
    setLoading(false);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleViewMyRides = () => {
    // TODO: Navigate to my rides view or switch feed tab
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* Photo & Name */}
      <View style={styles.photoSection}>
        <TouchableOpacity onPress={pickImage} disabled={loading}>
          {profile?.photo_url ? (
            <Image source={{ uri: profile.photo_url }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="person" size={40} color={colors.textMuted} />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.displayName}>{profile?.display_name}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{myRides.length}</Text>
          <Text style={styles.statLabel}>Rides Posted</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Rides Joined</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={updateLocation}>
          <Ionicons name="location" size={20} color={colors.primary} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Update Location</Text>
            <Text style={styles.actionSubtitle} numberOfLines={1}>
              {profile?.location?.city || 'Not set'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
          <Ionicons name="image" size={20} color={colors.primary} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Change Photo</Text>
            <Text style={styles.actionSubtitle}>Update your profile picture</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleSignOut}>
          <Ionicons name="log-out" size={20} color={colors.error} />
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.error }]}>Sign Out</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl + spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.md,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  displayName: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  actions: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.cardBackground,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
