package main

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"golang.org/x/net/html"
)

func login(client *http.Client, username, password string) error {
	req, err := http.NewRequest("GET", "https://foundryvtt.com/admin/login/?next=/admin/", nil)
	if err != nil {
		return fmt.Errorf("failed to create http reques: %v", err)
	}

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to fetch: %v", err)
	}
	defer resp.Body.Close()
	token, err := parseCSRFToken(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read token: %v", err)
	}

	formData := url.Values{}
	formData.Set("username", username)
	formData.Set("password", password)
	formData.Set("next", "/admin/")
	formData.Set("csrfmiddlewaretoken", token)
	postReq, err := http.NewRequest("POST", "https://foundryvtt.com/admin/login/?next=/admin/", strings.NewReader(formData.Encode()))
	if err != nil {
		return fmt.Errorf("failed to create post request: %v", err)
	}
	postReq.Header.Set("Referer", "https://foundryvtt.com/admin/login/?next=/admin/")
	postReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	postResp, err := client.Do(postReq)
	if err != nil {
		return fmt.Errorf("failed to post login form: %v", err)
	}
	defer postResp.Body.Close()
	return nil
}

func parseCSRFToken(reader io.ReadCloser) (string, error) {
	doc, err := html.Parse(reader)
	if err != nil {
		return "", fmt.Errorf("failed to parse html %v", err)
	}
	var token string
	var walk func(*html.Node)
	walk = func(n *html.Node) {
		if n.Type == html.ElementNode && n.Data == "input" {
			var correctField bool
			for _, attr := range n.Attr {
				if attr.Key == "name" && attr.Val == "csrfmiddlewaretoken" {
					correctField = true
					break
				}
			}
			if correctField {
				for _, attr := range n.Attr {
					if attr.Key == "value" {
						token = attr.Val
						return
					}
				}
			}
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			walk(c)
		}
	}
	walk(doc)
	if token == "" {
		return "", errors.New("failed to find csrf token")
	}
	return token, nil
}

func getPackageForm(client *http.Client, packageId int) (url.Values, error) {
	targetURL := fmt.Sprintf("https://foundryvtt.com/admin/packages/package/%d/change/", packageId)
	req, err := http.NewRequest("GET", targetURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create get request: %v", err)
	}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch submission form: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("non 200 status %d %s", resp.StatusCode, resp.Status)
	}

	submissionForm, err := html.Parse(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to parse edit form: %v", err)
	}
	forms := parseForms(submissionForm)
	if len(forms) != 1 {
		return nil, fmt.Errorf("got multiple forms: %d", len(forms))
	}

	return forms[0].Values, nil
}

type VersionEntry struct {
	version               string
	manifestURL           string
	notesURL              string
	requiredCoreVersion   string
	compatibleCoreVersion string
}

// addNewVersion adds a new version to the package. NOTE: initialFormValues is modified.
func addNewVersion(client *http.Client, packageId int, initialFormValues url.Values, versionData VersionEntry) error {
	targetURL, err := url.Parse(fmt.Sprintf("https://foundryvtt.com/admin/packages/package/%d/change/", packageId))
	if err != nil {
		return fmt.Errorf("error parsing URL: %v", err)
	}

	// we're using initial_forms intead of total_forms since the form data's
	// version count is zero-index based.
	newVersion := initialFormValues.Get("versions-INITIAL_FORMS")
	initialFormValues.Set(fmt.Sprintf("versions-%s-id", newVersion), "")
	initialFormValues.Set(fmt.Sprintf("versions-%s-package", newVersion), fmt.Sprintf("%d", packageId))
	initialFormValues.Set(fmt.Sprintf("versions-%s-version", newVersion), versionData.version)
	initialFormValues.Set(fmt.Sprintf("versions-%s-manifest", newVersion), versionData.manifestURL)
	initialFormValues.Set(fmt.Sprintf("versions-%s-notes", newVersion), versionData.notesURL)
	initialFormValues.Set(fmt.Sprintf("versions-%s-required_core_version", newVersion), versionData.requiredCoreVersion)
	initialFormValues.Set(fmt.Sprintf("versions-%s-compatible_core_version", newVersion), versionData.compatibleCoreVersion)

	// drop the _save but keep the _continue
	initialFormValues.Del("_save")
	// initialFormValues.Set("_save", "Save")

	req, err := http.NewRequest("POST", targetURL.String(), strings.NewReader(initialFormValues.Encode()))
	if err != nil {
		return fmt.Errorf("failed to create post new version request: %v", err)
	}
	req.Header.Add("Referer", targetURL.String())
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to post new version %v", err)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response body %v", err)
	}
	if resp.StatusCode != http.StatusFound && resp.StatusCode != http.StatusOK {
		return fmt.Errorf("submission failed with status %d: %s", resp.StatusCode, string(body))
	}
	return nil
}
