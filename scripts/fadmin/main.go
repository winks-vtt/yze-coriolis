package main

import (
	"errors"
	"flag"
	"log"
	"net/http"
	"net/http/cookiejar"
)

var packageId int
var username string
var password string

var version string
var manifestURL string
var notesURL string
var requiredCoreVersion string
var compatibleCoreVersion string

func init() {
	flag.IntVar(&packageId, "packageId", 0, "ID of foundry package in admin panel")
	flag.StringVar(&username, "username", "", "username of admin")
	flag.StringVar(&password, "password", "", "password for admin")
	flag.StringVar(&version, "version", "", "version of system or module (ie, 1.2.3)")
	flag.StringVar(&manifestURL, "manifest", "", "full URL to system.json")
	flag.StringVar(&notesURL, "notes", "", "full URL to changelog")
	flag.StringVar(&requiredCoreVersion, "required", "", "minimum required core version (ie, 0.8.6)")
	flag.StringVar(&compatibleCoreVersion, "compatible", "", "compatible core version (ie, 0.8.6)")
}

func main() {
	flag.Parse()

	if err := validateArgs(); err != nil {
		log.Fatalln("missing required flags. use --help for more info.", err)
	}

	client := &http.Client{}
	jar, err := cookiejar.New(nil)

	if err != nil {
		log.Fatalln("failed to create cookie jar", err)
	}
	client.Jar = jar

	if err := login(client, username, password); err != nil {
		log.Fatalln("failed to login", err)
	}
	values, err := getPackageForm(client, packageId)
	if err != nil {
		log.Fatalln("failed to fetch form submission")
	}

	err = addNewVersion(client, packageId, values, VersionEntry{
		version:               version,
		manifestURL:           manifestURL,
		notesURL:              notesURL,
		requiredCoreVersion:   requiredCoreVersion,
		compatibleCoreVersion: compatibleCoreVersion,
	})
	if err != nil {
		log.Fatalln("failed to update to new version", err)
	}
}

func validateArgs() error {
	if packageId == 0 {
		return errors.New("missing packageId flag")
	}
	if username == "" {
		return errors.New("missing username flag")
	}
	if password == "" {
		return errors.New("missing password flag")
	}

	if version == "" {
		return errors.New("missing version flag")
	}
	if manifestURL == "" {
		return errors.New("missing manifest flag")
	}
	if notesURL == "" {
		return errors.New("missing notes flag")
	}
	if requiredCoreVersion == "" {
		return errors.New("missing required flag")
	}
	if compatibleCoreVersion == "" {
		return errors.New("missing compatible flag")
	}
	return nil
}
