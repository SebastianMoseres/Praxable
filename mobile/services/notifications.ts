import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export interface NotificationService {
    requestPermissions: () => Promise<boolean>;
    scheduleTaskReminder: (taskName: string, timeString: string) => Promise<string | null>;
    cancelNotification: (notificationId: string) => Promise<void>;
    cancelAllNotifications: () => Promise<void>;
}

class NotificationServiceImpl implements NotificationService {
    async requestPermissions(): Promise<boolean> {
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Notification permissions not granted');
                return false;
            }

            // For Android, set up notification channel
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('tasks', {
                    name: 'Task Reminders',
                    importance: Notifications.AndroidImportance.HIGH,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#667eea',
                });
            }

            return true;
        } catch (error) {
            console.warn('Notifications not supported in Expo Go. Use a development build for full notification support.');
            console.error('Error requesting notification permissions:', error);
            return false;
        }
    }

    async scheduleTaskReminder(
        taskName: string,
        timeString: string
    ): Promise<string | null> {
        try {
            // Parse time (format: "HH:MM")
            const [hours, minutes] = timeString.split(':').map(Number);

            const scheduledDate = new Date();
            scheduledDate.setHours(hours || 0, minutes || 0, 0, 0);

            // If time is in the past today, schedule for tomorrow
            const now = new Date();
            if (scheduledDate <= now) {
                scheduledDate.setDate(scheduledDate.getDate() + 1);
            }

            // Schedule notification 5 minutes before
            const reminderDate = new Date(scheduledDate.getTime() - 5 * 60 * 1000);

            // Calculate seconds from now until reminder time
            const secondsUntilReminder = Math.max(
                0,
                Math.floor((reminderDate.getTime() - now.getTime()) / 1000)
            );

            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: '⏰ Upcoming Task',
                    body: `"${taskName}" starts in 5 minutes`,
                    data: { taskName },
                    sound: true,
                },
                trigger: secondsUntilReminder > 0
                    ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: secondsUntilReminder }
                    : null,
            });

            console.log(`Scheduled notification ${notificationId} for ${reminderDate}`);
            return notificationId;
        } catch (error) {
            console.warn('Notification scheduling not available in Expo Go. Task saved without reminder.');
            console.error('Error scheduling notification:', error);
            return null;
        }
    }

    async cancelNotification(notificationId: string): Promise<void> {
        try {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
            console.log(`Cancelled notification ${notificationId}`);
        } catch (error) {
            console.error('Error cancelling notification:', error);
        }
    }

    async cancelAllNotifications(): Promise<void> {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            console.log('Cancelled all notifications');
        } catch (error) {
            console.error('Error cancelling all notifications:', error);
        }
    }
}

export const notificationService = new NotificationServiceImpl();
