import StorageStack from "./StorageStack";
import ApiStack from "./ApiStack";

export default function main(app) {
  // new StorageStack(app, "storage");
  const storageStack = new StorageStack(app, "storage");
}
