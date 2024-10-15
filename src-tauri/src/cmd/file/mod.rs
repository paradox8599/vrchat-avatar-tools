mod create;
mod delete;
mod download;
mod query;
mod upload;

pub use create::*;
pub use delete::*;
pub use download::*;
pub use query::*;
pub use upload::*;

use serde::{Deserialize, Serialize};

use super::handle_api_error;

#[derive(Serialize, Deserialize, Debug)]
pub enum FileType {
    #[serde(rename = "file")]
    File,
    #[serde(rename = "signature")]
    Signagure,
    #[serde(rename = "delta")]
    Delta,
}

impl std::fmt::Display for FileType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let name = match self {
            Self::File => "file",
            Self::Signagure => "signature",
            Self::Delta => "delta",
        };
        write!(f, "{name}")
    }
}
