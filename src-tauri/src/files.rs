use crate::err::{AppError, AppFileError};
use bytes::Bytes;
use std::path::{Path, PathBuf};
use tauri::{path::BaseDirectory, Manager};

pub struct AppFiles {
    app: tauri::AppHandle,
    base_dir: BaseDirectory,
    path: PathBuf,
}

impl AppFiles {
    pub fn new(app: &tauri::AppHandle, base_dir: BaseDirectory, prefix: Option<&str>) -> Self {
        let prefix = prefix.unwrap_or("files");

        Self {
            app: app.clone(),
            base_dir,
            path: PathBuf::from(prefix),
        }
    }

    pub fn exists(file_path: &Path) -> Result<bool, AppError> {
        let exists = file_path
            .try_exists()
            .map_err(|e| AppFileError::Open(e.to_string()))?;
        Ok(exists)
    }

    pub fn get_file_path(&self, file_id: Option<&str>) -> Result<PathBuf, AppError> {
        let mut path = self.path.clone();

        path = self
            .app
            .path()
            .resolve(path, self.base_dir)
            .map_err(|e| AppFileError::Path(e.to_string()))?;

        if !Self::exists(&path)? {
            std::fs::create_dir_all(&path).map_err(|e| AppFileError::Path(e.to_string()))?;
        }

        if file_id.is_some() {
            path = path.join(file_id.unwrap());
        }

        Ok(path)
    }

    pub fn read(&self, file_name: &str) -> Result<Option<bytes::Bytes>, AppError> {
        let path = self.get_file_path(Some(file_name))?;
        if !Self::exists(&path)? {
            return Ok(None);
        }
        let file = std::fs::read(path).map_err(|e| AppFileError::Read(e.to_string()))?;
        Ok(Some(file.into()))
    }

    pub fn write(&self, file_name: &str, bytes: Bytes) -> Result<(), AppError> {
        let path = self.get_file_path(Some(file_name))?;
        std::fs::write(path, bytes).map_err(|e| AppFileError::Write(e.to_string()))?;
        Ok(())
    }

    pub fn delete(&self, file_name: &str) -> Result<(), AppError> {
        let path = self.get_file_path(Some(file_name))?;
        std::fs::remove_file(path).map_err(|e| AppFileError::Delete(e.to_string()))?;
        Ok(())
    }

    pub fn clear(&self) -> Result<(), AppError> {
        let path = self.get_file_path(None)?;
        std::fs::remove_dir_all(path).map_err(|e| AppFileError::Delete(e.to_string()))?;
        Ok(())
    }

    pub fn list(&self) -> Result<Vec<String>, AppError> {
        let path = self.get_file_path(None)?;

        if !Self::exists(&path)? {
            return Ok(vec![]);
        }

        let dirs = std::fs::read_dir(path).map_err(|e| AppFileError::Read(e.to_string()))?;
        let mut filenames = vec![];
        for dir in dirs {
            let dir = dir.map_err(|e| AppFileError::Read(e.to_string()))?;
            let fname = dir.file_name();
            let fname = fname.to_string_lossy();
            filenames.push(fname.to_string());
        }
        Ok(filenames)
    }
}
