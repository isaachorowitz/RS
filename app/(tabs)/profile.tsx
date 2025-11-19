import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useAuthStore } from '@/stores/authStore';
import { useRidesStore } from '@/stores/ridesStore';
import { supabase } from '@/lib/supabase';
import { colors } from '@/constants/colors';
import { commonStyles, spacing, borderRadius, fontSize } from '@/constants/styles';
import { Location as LocationType } from '@/types/database';

export default function ProfileScreen() {
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);
  const updateProfile = useAuthStore(state => state.updateProfile);
  const signOut = useAuthStore(state => state.signOut);
  const userInterests = useRidesStore(state => state.userInterests);
  const fetchUserInterests = useRidesStore(state => state.fetchUserInterests);
  const addUserInterest = useRidesStore(state => state.addUserInterest);
  const removeUserInterest = useRidesStore(state => state.removeUserInterest);
  
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddInterest, setShowAddInterest] = useState(false);
  const [newInterestName, setNewInterestName] = useState('');
  const [newInterestRadius, setNewInterestRadius] = useState('50');
  const router = useRouter();

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
    }
    if (user) {
      fetchUserInterests(user.id);
    }
  }, [profile, user]);

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

    if (!result.canceled && result.assets[0] && user) {
      setLoading(true);
      const uri = result.assets[0].uri;
      
      // Upload photo
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
        Alert.alert('Permission Required', 'We need permission to access your location');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });

      const locationData: LocationType = {
        latitude,
        longitude,
        address: `${address.street || ''}, ${address.city || ''}, ${address.country || ''}`,
        city: address.city || undefined,
      };

      await updateProfile({ location: locationData });
      Alert.alert('Success', 'Location updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update location');
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!displayName) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }

    setLoading(true);
    await updateProfile({ display_name: displayName });
    setLoading(false);
    setEditing(false);
  };

  const handleAddInterest = async () => {
    if (!newInterestName || !user) return;

    const radius = parseInt(newInterestRadius);
    if (isNaN(radius) || radius < 1) {
      Alert.alert('Error', 'Invalid radius');
      return;
    }

    setLoading(true);
    const { error } = await addUserInterest({
      user_id: user.id,
      place_name: newInterestName,
      place_location: null,
      preferred_times: [],
      radius_km: radius,
    });

    if (error) {
      Alert.alert('Error', error);
    } else {
      setNewInterestName('');
      setNewInterestRadius('50');
      setShowAddInterest(false);
    }
    setLoading(false);
  };

  const handleRemoveInterest = async (id: string) => {
    await removeUserInterest(id);
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
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

  return (
    <View style={commonStyles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.content}>
          {/* Profile Photo */}
          <View style={styles.photoSection}>
            <TouchableOpacity onPress={pickImage} disabled={loading}>
              {profile?.photo_url ? (
                <Image source={{ uri: profile.photo_url }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderText}>+</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Display Name */}
          <View style={commonStyles.cardLarge}>
            <Text style={styles.label}>Display Name</Text>
            {editing ? (
              <TextInput
                style={[commonStyles.input, styles.input]}
                value={displayName}
                onChangeText={setDisplayName}
                editable={!loading}
              />
            ) : (
              <Text style={styles.value}>{profile?.display_name}</Text>
            )}
            
            <Text style={[styles.label, { marginTop: spacing.lg }]}>Email</Text>
            <Text style={styles.value}>{profile?.email}</Text>

            <View style={styles.buttonRow}>
              {editing ? (
                <>
                  <TouchableOpacity
                    style={[commonStyles.secondaryButton, styles.halfButton]}
                    onPress={() => {
                      setEditing(false);
                      setDisplayName(profile?.display_name || '');
                    }}
                    disabled={loading}
                  >
                    <Text style={commonStyles.secondaryButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[commonStyles.primaryButton, styles.halfButton]}
                    onPress={handleSaveProfile}
                    disabled={loading}
                  >
                    <Text style={commonStyles.buttonText}>Save</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={commonStyles.secondaryButton}
                  onPress={() => setEditing(true)}
                >
                  <Text style={commonStyles.secondaryButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Location */}
          <View style={commonStyles.cardLarge}>
            <Text style={styles.label}>Location</Text>
            {profile?.location ? (
              <>
                <Text style={styles.value}>{profile.location.city}</Text>
                <Text style={styles.subvalue} numberOfLines={2}>
                  {profile.location.address}
                </Text>
              </>
            ) : (
              <Text style={styles.subvalue}>No location set</Text>
            )}
            <TouchableOpacity
              style={[commonStyles.secondaryButton, { marginTop: spacing.md }]}
              onPress={updateLocation}
              disabled={loading}
            >
              <Text style={commonStyles.secondaryButtonText}>Update Location</Text>
            </TouchableOpacity>
          </View>

          {/* Interests */}
          <View style={commonStyles.cardLarge}>
            <Text style={styles.label}>Your Interests</Text>
            <Text style={styles.subvalue}>
              Add places you frequently travel to for a personalized feed
            </Text>

            <View style={styles.interestsList}>
              {userInterests.map(interest => (
                <View key={interest.id} style={styles.interestItem}>
                  <View style={styles.interestInfo}>
                    <Text style={styles.interestName}>{interest.place_name}</Text>
                    <Text style={styles.interestRadius}>
                      Within {interest.radius_km}km
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveInterest(interest.id)}
                    disabled={loading}
                  >
                    <Text style={styles.removeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {showAddInterest ? (
              <View style={styles.addInterestForm}>
                <TextInput
                  style={[commonStyles.input, styles.input]}
                  placeholder="Place name (e.g., Tel Aviv)"
                  placeholderTextColor={colors.textMuted}
                  value={newInterestName}
                  onChangeText={setNewInterestName}
                  editable={!loading}
                />
                <TextInput
                  style={[commonStyles.input, styles.input]}
                  placeholder="Radius (km)"
                  placeholderTextColor={colors.textMuted}
                  value={newInterestRadius}
                  onChangeText={setNewInterestRadius}
                  keyboardType="numeric"
                  editable={!loading}
                />
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[commonStyles.secondaryButton, styles.halfButton]}
                    onPress={() => {
                      setShowAddInterest(false);
                      setNewInterestName('');
                      setNewInterestRadius('50');
                    }}
                    disabled={loading}
                  >
                    <Text style={commonStyles.secondaryButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[commonStyles.primaryButton, styles.halfButton]}
                    onPress={handleAddInterest}
                    disabled={loading}
                  >
                    <Text style={commonStyles.buttonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[commonStyles.secondaryButton, { marginTop: spacing.md }]}
                onPress={() => setShowAddInterest(true)}
              >
                <Text style={commonStyles.secondaryButtonText}>+ Add Interest</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Sign Out */}
          <TouchableOpacity
            style={[commonStyles.secondaryButton, styles.signOutButton]}
            onPress={handleSignOut}
          >
            <Text style={[commonStyles.secondaryButtonText, { color: colors.error }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: spacing.xxxl,
  },
  header: {
    padding: spacing.xxl,
    paddingTop: spacing.xxxl * 2,
  },
  title: {
    fontSize: fontSize.xxxl + 8,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    padding: spacing.xxl,
    gap: spacing.lg,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  photoPlaceholderText: {
    fontSize: fontSize.xxxl * 2,
    color: colors.primary,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
  },
  subvalue: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  input: {
    marginTop: spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  halfButton: {
    flex: 1,
  },
  interestsList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  interestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  interestInfo: {
    flex: 1,
  },
  interestName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  interestRadius: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  removeButton: {
    fontSize: fontSize.xl,
    color: colors.error,
    paddingHorizontal: spacing.sm,
  },
  addInterestForm: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  signOutButton: {
    marginTop: spacing.lg,
    borderColor: colors.error,
  },
});

