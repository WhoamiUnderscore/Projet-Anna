// @ts-nocheck
export default function formToObject<T>( form_data: FromData ): T {
  let obj: Partial<T> = {};

  form_data.forEach((value, key) => {
    if ( typeof value == "string") {
      try {
        (obj as any)[key as keyof T] = JSON.parse(value);
      } catch {
        (obj as any)[key as keyof T] = value;
      }
    } else {
        (obj as any)[key as keyof T] = value;
    }
  })

  return obj as T;
}
