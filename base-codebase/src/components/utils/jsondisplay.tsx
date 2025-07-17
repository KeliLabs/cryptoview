interface JsonDisplayProps {
  jsonData: unknown;
}

export default function JsonDisplay({ jsonData }: JsonDisplayProps) {
  return (
    <pre>{JSON.stringify(jsonData, null, 2)}</pre>
  );
}