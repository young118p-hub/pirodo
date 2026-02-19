import AsyncStorage from '@react-native-async-storage/async-storage';

export class BackupService {
  static async clearAllData(): Promise<void> {
    const allKeys = await AsyncStorage.getAllKeys();
    const pirodoKeys = allKeys.filter(key => key.startsWith('@pirodo_'));
    await AsyncStorage.multiRemove(pirodoKeys);
  }
}
