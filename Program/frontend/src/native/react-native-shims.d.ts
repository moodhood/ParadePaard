declare module "react-native" {
    import type React from "react";

    type NativeStyle = Record<string, unknown> | NativeStyle[] | null | undefined;

    type PressEvent = {
        stopPropagation: () => void;
    };

    type BaseProps = {
        children?: React.ReactNode;
        style?: NativeStyle;
        disabled?: boolean;
    };

    type PressableProps = BaseProps & {
        onPress?: (event: PressEvent) => void | Promise<void>;
    };

    type TextInputProps = BaseProps & {
        editable?: boolean;
        multiline?: boolean;
        value?: string;
        secureTextEntry?: boolean;
        placeholder?: string;
        onChangeText?: (text: string) => void;
    };

    type ModalProps = BaseProps & {
        visible?: boolean;
        transparent?: boolean;
        animationType?: "none" | "slide" | "fade";
        onRequestClose?: () => void;
    };

    type ImageProps = BaseProps & {
        source?: { uri: string };
        accessibilityLabel?: string;
    };

    type ScrollViewProps = BaseProps;

    export const View: React.ComponentType<BaseProps>;
    export const Text: React.ComponentType<BaseProps>;
    export const Pressable: React.ComponentType<PressableProps>;
    export const TextInput: React.ComponentType<TextInputProps>;
    export const Modal: React.ComponentType<ModalProps>;
    export const Image: React.ComponentType<ImageProps>;
    export const ScrollView: React.ComponentType<ScrollViewProps>;

    export const Linking: {
        openURL: (url: string) => Promise<void>;
    };

    export const Platform: {
        OS: string;
    };

    export const Share: {
        share: (content: { title?: string; url?: string; message?: string }) => Promise<void>;
    };
}

declare module "react-native-document-picker" {
    type PickedDocument = {
        uri: string;
        name?: string | null;
        type?: string | null;
        size?: number | null;
    };

    const DocumentPicker: {
        pickSingle: () => Promise<PickedDocument>;
        isCancel: (error: unknown) => boolean;
    };

    export default DocumentPicker;
}

declare module "@react-native-async-storage/async-storage" {
    const AsyncStorage: {
        getAllKeys: () => Promise<string[]>;
        multiGet: (keys: string[]) => Promise<Array<[string, string | null]>>;
        multiRemove: (keys: string[]) => Promise<void>;
        removeItem: (key: string) => Promise<void>;
        setItem: (key: string, value: string) => Promise<void>;
    };

    export default AsyncStorage;
}
