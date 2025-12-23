import { type FileType } from "@/types/file-types"

export default class Github {
  private repoOwner = "WhoamiUnderscore"
  private repoName = "Projet-Anna"
  private branch = "main"
  private githubToken = process.env.GITHUB_CONNECTION

  private headers = {
    Authorization: `Bearer ${this.githubToken}`,
    Accept: "application/vnd.github+json",
    "Content-Type": 'application/json'
  }

  private async getBranch(): Promise<string> {
    let branchRefRequest = await fetch(
      `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/git/ref/heads/${this.branch}`,
      { headers: this.headers }
    )

    let branchRef = await branchRefRequest.json();

    return branchRef.object.sha;
  }

  private async getLastCommit(sha: string): Promise<string> {
    let commitRefRequest = await fetch(
      `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/git/commits/${sha}`,
      { headers: this.headers }
    )

    let commitRef = await commitRefRequest.json()

    return commitRef.tree.sha
  }

  private async create_blob(base64: string): Promise<string> {
    let createBlobRefRequest = await fetch(
      `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/git/blobs`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          content: base64,
          encoding: "base64" 
        })
      }
    )

    let createBlobRef = await createBlobRefRequest.json()

    return createBlobRef.sha
  }

  private async create_tree(sha: string, files: FileType[]): Promise<string> {
    const treeItems = [];

    for (const file of files) {
      const blobSha = await this.create_blob(file.content);
      treeItems.push({
        path: file.path.replace(/^\/+/, ""), // enlever les / au début
        mode: "100644",
        type: "blob",
        sha: blobSha
      });
    }

    let treeRefRequest = await fetch(
      `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/git/trees`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          base_tree: sha,
          tree: treeItems 
        })
      }
    )

    let treeRef = await treeRefRequest.json() 

    return treeRef.sha
  }

  private async create_commit(last_commit_sha: string, tree_sha: string): Promise<string> {
    let createCommitRefRequest = await fetch(
      `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/git/commits`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          message: "Ajout de plusieurs fichier",
          tree: tree_sha,
          parents: [last_commit_sha]
        })
      }
    )

    let createCommitRef = await createCommitRefRequest.json()

    return createCommitRef.sha
  }

  private async delete_tree_item(base_tree_sha: string, path: string): Promise<string> {
    const treeRefRequest = await fetch(
      `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/git/trees`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          base_tree: base_tree_sha,
          tree: [
            {
              path: path.replace(/^\/+/, ""),
              mode: "100644",
              type: "blob",
              sha: null
            }
          ]
        })
      }
    )

    const treeRef = await treeRefRequest.json()
    return treeRef.sha
  }

  public async push_gihtub_files(files: FileType[]): Promise<boolean> {
    let commitSHA = await this.getBranch()

    let baseTreeSHA = await this.getLastCommit(commitSHA)

    let treeSHA = await this.create_tree(baseTreeSHA, files)

    if ( treeSHA === baseTreeSHA ) {
      console.log("GITHUB INFO: Nothing change !")
      return true
    }

    let createCommit = await this.create_commit(commitSHA, treeSHA)

    const pushCommit = await fetch(
      `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/git/refs/heads/${this.branch}`,
      {
        method: "PATCH",
        headers: this.headers,
        body: JSON.stringify({ sha: createCommit, force: true })
      }
    )

    if ( pushCommit.status === 200 ) {
      console.log("GITHUB INFO: Push pass !")
      return true
    }

    return false
  }

  public async delete_github_file(file_name: string): Promise<boolean> {
    let commitSHA = await this.getBranch();

    let baseTreeSHA = await this.getLastCommit(commitSHA);

    let deleteItem = await this.delete_tree_item(baseTreeSHA, `/public/images/${file_name}`);

    let createCommit = await this.create_commit(commitSHA, deleteItem);

    const pushCommit = await fetch(
      `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/git/refs/heads/${this.branch}`,
      {
        method: "PATCH",
        headers: this.headers,
        body: JSON.stringify({ sha: createCommit, force: true })
      }
    )

    if ( pushCommit.status === 200 ) {
      console.log("GITHUB INFO: File deleted !")
      return true
    }

    return false
  }
}
